'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './Modal.module.css'

interface JoinGroupModalProps {
  onClose: () => void
  onGroupJoined: () => void
}

export default function JoinGroupModal({ onClose, onGroupJoined }: JoinGroupModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Group code is required')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Find group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('code', code.trim().toUpperCase())
        .single()

      if (groupError || !group) {
        throw new Error('Group not found')
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        throw new Error('Already a member of this group')
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        } as any)

      if (memberError) throw memberError

      onGroupJoined()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Join Group</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="groupCode">Group Code</label>
            <input
              type="text"
              id="groupCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
