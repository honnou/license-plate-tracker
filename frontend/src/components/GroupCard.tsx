import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../types';
import './GroupCard.css';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div className="group-card" onClick={() => navigate(`/group/${group.id}`)}>
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <span className="group-code">{group.code}</span>
      </div>
      <div className="group-card-body">
        <p className="group-info">
          <strong>Members:</strong> {group.member_count || 0}
        </p>
        <p className="group-info">
          <strong>Created by:</strong> {group.creator_name || 'Unknown'}
        </p>
      </div>
      <div className="group-card-footer">
        <button className="view-group-button">View Group</button>
      </div>
    </div>
  );
};

export default GroupCard;
