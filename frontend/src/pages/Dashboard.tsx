import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../services/api';
import { Group } from '../types';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
  };

  const handleGroupJoined = (group: Group) => {
    setGroups([group, ...groups]);
    setShowJoinModal(false);
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>License Plate Tracker</h1>
        <div className="nav-right">
          <span className="username">Welcome, {user?.username}!</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>My Groups</h2>
          <div className="button-group">
            <button onClick={() => setShowCreateModal(true)} className="primary-button">
              Create Group
            </button>
            <button onClick={() => setShowJoinModal(true)} className="secondary-button">
              Join Group
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined any groups yet.</p>
            <p>Create a new group or join an existing one to start tracking license plates!</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </div>
  );
};

export default Dashboard;
