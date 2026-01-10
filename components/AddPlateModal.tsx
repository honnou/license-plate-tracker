'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { US_STATES, CANADIAN_PROVINCES, calculatePoints } from '@/types'
import styles from './Modal.module.css'

interface AddPlateModalProps {
  groupId: string
  userId: string
  onClose: () => void
  onPlateAdded: () => void
}

export default function AddPlateModal({ groupId, userId, onClose, onPlateAdded }: AddPlateModalProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [state, setState] = useState('')
  const [isVanity, setIsVanity] = useState(false)
  const [isSpecial, setIsSpecial] = useState(false)
  const [specialType, setSpecialType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!photo || !state) {
      setError('Photo and state are required')
      return
    }

    setLoading(true)

    try {
      // Check if user already has this state in this group
      const { data: existing } = await supabase
        .from('license_plates')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .eq('state', state)
        .single()

      if (existing) {
        throw new Error('You already have a plate from this state in this group')
      }

      // Upload photo to Supabase Storage
      const fileName = `${userId}/${groupId}/${Date.now()}-${photo.name}`
      const { error: uploadError } = await supabase.storage
        .from('license-plates')
        .upload(fileName, photo)

      if (uploadError) throw uploadError

      // Create license plate record
      const points = calculatePoints(isVanity, isSpecial)
      const { error: insertError } = await supabase
        .from('license_plates')
        .insert({
          user_id: userId,
          group_id: groupId,
          state,
          photo_path: fileName,
          is_vanity: isVanity,
          is_special: isSpecial,
          special_type: isSpecial && specialType ? specialType : null,
          points,
        } as any)

      if (insertError) throw insertError

      onPlateAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add plate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add License Plate</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Upload Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} required />
            {preview && <img src={preview} alt="Preview" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }} />}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="state">State/Province</label>
            <select id="state" value={state} onChange={e => setState(e.target.value)} required>
              <option value="">Select a region</option>
              <optgroup label="🇺🇸 United States">
                {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
              </optgroup>
              <optgroup label="🇨🇦 Canada">
                {CANADIAN_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
              </optgroup>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label><input type="checkbox" checked={isVanity} onChange={e => setIsVanity(e.target.checked)} /> Vanity Plate (+2 points)</label>
          </div>

          <div className={styles.formGroup}>
            <label><input type="checkbox" checked={isSpecial} onChange={e => setIsSpecial(e.target.checked)} /> Special/Commemorative Plate (+3 points)</label>
          </div>

          {isSpecial && (
            <div className={styles.formGroup}>
              <label htmlFor="specialType">Special Plate Type (Optional)</label>
              <input type="text" id="specialType" value={specialType} onChange={e => setSpecialType(e.target.value)} placeholder="e.g., Military, Veteran" />
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Adding...' : 'Add Plate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
