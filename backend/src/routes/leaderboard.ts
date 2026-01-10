import express, { Response } from 'express';
import { dbAll, dbGet } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { US_STATES } from '../types';

const router = express.Router();

// Get leaderboard for a group
router.get('/:groupId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Get leaderboard data
    const leaderboard = await dbAll(
      `SELECT
        u.id as user_id,
        u.username,
        COUNT(DISTINCT lp.state) as states_collected,
        COALESCE(SUM(lp.points), 0) as total_points
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       LEFT JOIN license_plates lp ON u.id = lp.user_id AND lp.group_id = ?
       WHERE gm.group_id = ?
       GROUP BY u.id, u.username
       ORDER BY total_points DESC, states_collected DESC`,
      [groupId, groupId]
    );

    // Add rank and states remaining
    const rankedLeaderboard = leaderboard.map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1,
      states_remaining: US_STATES.length - entry.states_collected
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed stats for a user in a group
router.get('/:groupId/user/:userId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const requestUserId = req.userId!;

    // Verify membership
    const membership = await dbGet(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, requestUserId]
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this group' });
      return;
    }

    // Get user stats
    const stats = await dbGet(
      `SELECT
        u.username,
        COUNT(DISTINCT lp.state) as states_collected,
        COALESCE(SUM(lp.points), 0) as total_points,
        COUNT(lp.id) as total_plates,
        SUM(CASE WHEN lp.is_vanity = 1 THEN 1 ELSE 0 END) as vanity_plates,
        SUM(CASE WHEN lp.is_special = 1 THEN 1 ELSE 0 END) as special_plates
       FROM users u
       LEFT JOIN license_plates lp ON u.id = lp.user_id AND lp.group_id = ?
       WHERE u.id = ?
       GROUP BY u.id, u.username`,
      [groupId, targetUserId]
    );

    if (!stats) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get collected states
    const collectedStates = await dbAll(
      `SELECT DISTINCT state FROM license_plates
       WHERE user_id = ? AND group_id = ?
       ORDER BY state ASC`,
      [targetUserId, groupId]
    );

    res.json({
      ...stats,
      states_remaining: US_STATES.length - (stats as any).states_collected,
      collected_states: collectedStates.map(s => (s as any).state)
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
