import React, { useState, useEffect } from 'react';
import { platesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { US_STATES } from '../types';
import './MapView.css';

interface MapViewProps {
  groupId: number;
  refreshKey: number;
}

interface StateData {
  code: string;
  name: string;
  collected: boolean;
  collectedBy?: string[];
}

const MapView: React.FC<MapViewProps> = ({ groupId, refreshKey }) => {
  const { user } = useAuth();
  const [statesData, setStatesData] = useState<StateData[]>([]);
  const [userStates, setUserStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatesData();
  }, [groupId, refreshKey]);

  const fetchStatesData = async () => {
    try {
      const [allPlatesResponse, userStatesResponse] = await Promise.all([
        platesAPI.getGroupPlates(groupId),
        platesAPI.getUserStates(groupId)
      ]);

      const allPlates = allPlatesResponse.data;
      const userCollectedStates = userStatesResponse.data;
      setUserStates(userCollectedStates);

      // Create a map of states to users who collected them
      const stateCollectors: { [key: string]: string[] } = {};
      allPlates.forEach((plate: any) => {
        if (!stateCollectors[plate.state]) {
          stateCollectors[plate.state] = [];
        }
        if (!stateCollectors[plate.state].includes(plate.username)) {
          stateCollectors[plate.state].push(plate.username);
        }
      });

      // Map all US states with their collection status
      const mappedStates = US_STATES.map(state => ({
        code: state.code,
        name: state.name,
        collected: stateCollectors[state.code] ? true : false,
        collectedBy: stateCollectors[state.code] || []
      }));

      setStatesData(mappedStates);
    } catch (error) {
      console.error('Failed to fetch states data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-text">Loading map...</div>;
  }

  const collectedCount = statesData.filter(s => s.collected).length;
  const userCollectedCount = userStates.length;

  return (
    <div className="map-view">
      <div className="map-header">
        <h2>State Collection Map</h2>
        <div className="map-stats">
          <div className="stat">
            <div className="stat-value">{userCollectedCount}</div>
            <div className="stat-label">Your States</div>
          </div>
          <div className="stat">
            <div className="stat-value">{collectedCount}</div>
            <div className="stat-label">Group Total</div>
          </div>
          <div className="stat">
            <div className="stat-value">{US_STATES.length - collectedCount}</div>
            <div className="stat-label">Remaining</div>
          </div>
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color yours"></div>
          <span>Collected by you</span>
        </div>
        <div className="legend-item">
          <div className="legend-color others"></div>
          <span>Collected by others</span>
        </div>
        <div className="legend-item">
          <div className="legend-color uncollected"></div>
          <span>Not collected</span>
        </div>
      </div>

      <div className="states-grid">
        {statesData.map((state) => {
          const collectedByUser = userStates.includes(state.code);
          const collectedByOthers = state.collected && !collectedByUser;

          return (
            <div
              key={state.code}
              className={`state-card ${
                collectedByUser ? 'yours' : collectedByOthers ? 'others' : 'uncollected'
              }`}
              title={
                state.collected
                  ? `Collected by: ${state.collectedBy?.join(', ')}`
                  : 'Not yet collected'
              }
            >
              <div className="state-code">{state.code}</div>
              <div className="state-name">{state.name}</div>
              {state.collected && (
                <div className="checkmark">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapView;
