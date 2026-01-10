import React, { useState } from 'react';
import { groupsAPI } from '../services/api';
import { Group } from '../types';
import './Modal.css';

interface JoinGroupModalProps {
  onClose: () => void;
  onGroupJoined: (group: Group) => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onGroupJoined }) => {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await groupsAPI.join(groupCode.toUpperCase());
      onGroupJoined(response.data.group);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Group</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupCode">Group Code</label>
            <input
              type="text"
              id="groupCode"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
