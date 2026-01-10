import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { LeaderboardEntry } from '../types';
import './Leaderboard.css';

interface LeaderboardProps {
  groupId: number;
  refreshKey: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ groupId, refreshKey }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [groupId, refreshKey]);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getLeaderboard(groupId);
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-text">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      {entries.length === 0 ? (
        <div className="empty-leaderboard">
          <p>No data yet. Be the first to add a license plate!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="rank-col">Rank</div>
            <div className="player-col">Player</div>
            <div className="states-col">States</div>
            <div className="remaining-col">Remaining</div>
            <div className="points-col">Points</div>
          </div>
          {entries.map((entry) => (
            <div
              key={entry.user_id}
              className={`table-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
            >
              <div className="rank-col">
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && `#${entry.rank}`}
              </div>
              <div className="player-col">{entry.username}</div>
              <div className="states-col">{entry.states_collected}</div>
              <div className="remaining-col">{entry.states_remaining}</div>
              <div className="points-col">{entry.total_points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
