'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Group } from '@/types'
import GroupCard from './GroupCard'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import styles from './Dashboard.module.css'

interface DashboardClientProps {
  groups: Group[]
  username: string
}

export default function DashboardClient({ groups: initialGroups, username }: DashboardClientProps) {
  const [groups, setGroups] = useState(initialGroups)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const refreshGroups = () => {
    router.refresh()
  }

  return (
    <div className={styles.dashboard}>
      <nav className={styles.nav}>
        <h1>License Plate Tracker</h1>
        <div className={styles.navRight}>
          <span className={styles.username}>{username}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <h2>My Groups</h2>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Group
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              Join Group
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't joined any groups yet.</p>
            <p>Create a new group or join an existing one to start tracking license plates!</p>
          </div>
        ) : (
          <div className={styles.groupsGrid}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={refreshGroups}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={refreshGroups}
        />
      )}

      {/* Highway Sign */}
      <div className="highway-sign">
        25 Miles to<br />Seattle
      </div>
    </div>
  )
}
