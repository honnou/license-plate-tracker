import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/api';
import AddPlateModal from '../components/AddPlateModal';
import Leaderboard from '../components/Leaderboard';
import MapView from '../components/MapView';
import Gallery from '../components/Gallery';
import './GroupDetail.css';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'map' | 'gallery'>('leaderboard');
  const [showAddPlate, setShowAddPlate] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await groupsAPI.getAll();
      const foundGroup = response.data.find((g: any) => g.id === parseInt(groupId!));
      setGroup(foundGroup);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlateAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!group) {
    return <div className="error">Group not found</div>;
  }

  return (
    <div className="group-detail">
      <div className="group-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="group-title-section">
            <h1>{group.name}</h1>
            <div className="group-meta">
              <span className="group-code-badge">Code: {group.code}</span>
              <span className="member-count">{group.member_count} members</span>
            </div>
          </div>
          <button onClick={() => setShowAddPlate(true)} className="add-plate-button">
            + Add Plate
          </button>
        </div>
      </div>

      <div className="group-tabs">
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map
        </button>
        <button
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'leaderboard' && (
          <Leaderboard groupId={parseInt(groupId!)} refreshKey={refreshKey} />
        )}
        {activeTab === 'map' && (
          <MapView groupId={parseInt(groupId!)} refreshKey={refreshKey} />
        )}
        {activeTab === 'gallery' && (
          <Gallery groupId={parseInt(groupId!)} refreshKey={refreshKey} />
        )}
      </div>

      {showAddPlate && (
        <AddPlateModal
          groupId={parseInt(groupId!)}
          onClose={() => setShowAddPlate(false)}
          onPlateAdded={handlePlateAdded}
        />
      )}
    </div>
  );
};

export default GroupDetail;
