import React, { useState } from 'react';
import { platesAPI } from '../services/api';
import { US_STATES } from '../types';
import './Modal.css';

interface AddPlateModalProps {
  groupId: number;
  onClose: () => void;
  onPlateAdded: () => void;
}

const AddPlateModal: React.FC<AddPlateModalProps> = ({ groupId, onClose, onPlateAdded }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [state, setState] = useState('');
  const [isVanity, setIsVanity] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialType, setSpecialType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!photo || !state) {
      setError('Photo and state are required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('groupId', groupId.toString());
      formData.append('state', state);
      formData.append('isVanity', isVanity.toString());
      formData.append('isSpecial', isSpecial.toString());
      if (isSpecial && specialType) {
        formData.append('specialType', specialType);
      }

      await platesAPI.create(formData);
      onPlateAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add license plate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add License Plate</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Photo</label>
            <div className="file-input-wrapper">
              <label htmlFor="photo" className="file-input-label">
                Choose Photo
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                required
              />
            </div>
            {photo && <div className="file-name">Selected: {photo.name}</div>}
          </div>

          {photoPreview && (
            <div className="image-preview">
              <img src={photoPreview} alt="Preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="state">State/Territory</label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            >
              <option value="">Select a state</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isVanity"
                checked={isVanity}
                onChange={(e) => setIsVanity(e.target.checked)}
              />
              <label htmlFor="isVanity">Vanity Plate (+2 points)</label>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isSpecial"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
              />
              <label htmlFor="isSpecial">Special/Commemorative Plate (+3 points)</label>
            </div>
          </div>

          {isSpecial && (
            <div className="form-group">
              <label htmlFor="specialType">Special Plate Type (Optional)</label>
              <input
                type="text"
                id="specialType"
                value={specialType}
                onChange={(e) => setSpecialType(e.target.value)}
                placeholder="e.g., Military, Veteran, Historical"
              />
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add Plate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlateModal;
