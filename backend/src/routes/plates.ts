import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { dbRun, dbAll, dbGet } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculatePoints } from '../utils/helpers';
import { US_STATES } from '../types';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Log a new license plate
router.post('/', authenticateToken, upload.single('photo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { groupId, state, isVanity, isSpecial, specialType } = req.body;

    if (!groupId || !state) {
      res.status(400).json({ error: 'Group ID and state are required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Photo is required' });
      return;
    }

    // Validate state
    if (!US_STATES.includes(state.toUpperCase())) {
      res.status(400).json({ error: 'Invalid state code' });
      return;
    }

    // Verify user is member of group
    const membership = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this group' });
      return;
    }

    // Calculate points
    const points = calculatePoints(isVanity === 'true', isSpecial === 'true');

    // Insert license plate
    const result = await dbRun(
      `INSERT INTO license_plates
       (user_id, group_id, state, photo_path, is_vanity, is_special, special_type, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        groupId,
        state.toUpperCase(),
        req.file.filename,
        isVanity === 'true' ? 1 : 0,
        isSpecial === 'true' ? 1 : 0,
        specialType || null,
        points
      ]
    );

    const plateId = (result as any).lastID;

    res.status(201).json({
      id: plateId,
      message: 'License plate logged successfully',
      points
    });
  } catch (error) {
    console.error('Log plate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all plates for a group
router.get('/group/:groupId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId!;

    // Verify membership
    const membership = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this group' });
      return;
    }

    const plates = await dbAll(
      `SELECT lp.*, u.username
       FROM license_plates lp
       JOIN users u ON lp.user_id = u.id
       WHERE lp.group_id = ?
       ORDER BY lp.spotted_at DESC`,
      [groupId]
    );

    res.json(plates);
  } catch (error) {
    console.error('Get plates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's plates in a group
router.get('/group/:groupId/user', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId!;

    // Verify membership
    const membership = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this group' });
      return;
    }

    const plates = await dbAll(
      `SELECT * FROM license_plates
       WHERE group_id = ? AND user_id = ?
       ORDER BY spotted_at DESC`,
      [groupId, userId]
    );

    res.json(plates);
  } catch (error) {
    console.error('Get user plates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get states collected by user in a group
router.get('/group/:groupId/user/states', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId!;

    const states = await dbAll(
      `SELECT DISTINCT state FROM license_plates
       WHERE group_id = ? AND user_id = ?
       ORDER BY state ASC`,
      [groupId, userId]
    );

    res.json(states.map(s => (s as any).state));
  } catch (error) {
    console.error('Get user states error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
