import express, { Response } from 'express';
import { dbRun, dbGet, dbAll } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateGroupCode } from '../utils/helpers';
import { Group } from '../types';

const router = express.Router();

// Create a new group
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.userId!;

    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    // Generate unique code
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = generateGroupCode();
      const existing = await dbGet('SELECT id FROM groups WHERE code = ?', [code]);
      if (!existing) isUnique = true;
    }

    // Create group
    const result = await dbRun(
      'INSERT INTO groups (name, code, created_by) VALUES (?, ?, ?)',
      [name, code!, userId]
    );

    const groupId = (result as any).lastID;

    // Add creator as member
    await dbRun(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    res.status(201).json({
      id: groupId,
      name,
      code: code!,
      created_by: userId
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a group by code
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userId = req.userId!;

    if (!code) {
      res.status(400).json({ error: 'Group code is required' });
      return;
    }

    // Find group
    const group = await dbGet('SELECT * FROM groups WHERE code = ?', [code]) as Group | undefined;

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if already a member
    const existingMember = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [group.id, userId]
    );

    if (existingMember) {
      res.status(409).json({ error: 'Already a member of this group' });
      return;
    }

    // Add user to group
    await dbRun(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [group.id, userId]
    );

    res.json({
      message: 'Joined group successfully',
      group: {
        id: group.id,
        name: group.name,
        code: group.code
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's groups
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const groups = await dbAll(
      `SELECT g.*, u.username as creator_name,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE gm.user_id = ?
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group members
router.get('/:groupId/members', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId!;

    // Verify user is a member
    const membership = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this group' });
      return;
    }

    const members = await dbAll(
      `SELECT u.id, u.username, u.email, gm.joined_at
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = ?
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
