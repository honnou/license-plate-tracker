import React, { useState, useEffect } from 'react';
import { platesAPI } from '../services/api';
import { LicensePlate } from '../types';
import './Gallery.css';

interface GalleryProps {
  groupId: number;
  refreshKey: number;
}

const Gallery: React.FC<GalleryProps> = ({ groupId, refreshKey }) => {
  const [plates, setPlates] = useState<LicensePlate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlate, setSelectedPlate] = useState<LicensePlate | null>(null);

  useEffect(() => {
    fetchPlates();
  }, [groupId, refreshKey]);

  const fetchPlates = async () => {
    try {
      const response = await platesAPI.getGroupPlates(groupId);
      setPlates(response.data);
    } catch (error) {
      console.error('Failed to fetch plates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading-text">Loading gallery...</div>;
  }

  return (
    <div className="gallery">
      <h2>License Plate Gallery</h2>
      {plates.length === 0 ? (
        <div className="empty-gallery">
          <p>No license plates yet. Start adding plates to build your collection!</p>
        </div>
      ) : (
        <>
          <div className="gallery-stats">
            <div className="stat-item">
              <strong>Total Plates:</strong> {plates.length}
            </div>
            <div className="stat-item">
              <strong>Unique States:</strong> {new Set(plates.map(p => p.state)).size}
            </div>
          </div>

          <div className="plates-grid">
            {plates.map((plate) => (
              <div
                key={plate.id}
                className="plate-card"
                onClick={() => setSelectedPlate(plate)}
              >
                <div className="plate-image">
                  <img
                    src={`/uploads/${plate.photo_path}`}
                    alt={`${plate.state} license plate`}
                  />
                </div>
                <div className="plate-info">
                  <div className="plate-state">{plate.state}</div>
                  <div className="plate-user">By: {plate.username}</div>
                  <div className="plate-badges">
                    {plate.is_vanity && <span className="badge vanity">Vanity</span>}
                    {plate.is_special && <span className="badge special">Special</span>}
                  </div>
                  <div className="plate-points">{plate.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPlate && (
        <div className="plate-modal" onClick={() => setSelectedPlate(null)}>
          <div className="plate-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPlate(null)}>
              &times;
            </button>
            <img
              src={`/uploads/${selectedPlate.photo_path}`}
              alt={`${selectedPlate.state} license plate`}
            />
            <div className="plate-details">
              <h3>{selectedPlate.state}</h3>
              <p><strong>Spotted by:</strong> {selectedPlate.username}</p>
              <p><strong>Date:</strong> {formatDate(selectedPlate.spotted_at)}</p>
              <p><strong>Points:</strong> {selectedPlate.points}</p>
              {selectedPlate.is_vanity && <p className="detail-badge">✨ Vanity Plate</p>}
              {selectedPlate.is_special && (
                <p className="detail-badge">
                  ⭐ Special Plate
                  {selectedPlate.special_type && ` (${selectedPlate.special_type})`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
