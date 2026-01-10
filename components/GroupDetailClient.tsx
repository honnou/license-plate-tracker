'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Group } from '@/types'
import AddPlateModal from './AddPlateModal'
import Leaderboard from './Leaderboard'
import MapView from './MapView'
import Gallery from './Gallery'
import styles from './GroupDetail.module.css'

interface GroupDetailClientProps {
  group: Group
  userId: string
}

type Tab = 'leaderboard' | 'map' | 'gallery'

export default function GroupDetailClient({ group, userId }: GroupDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [showAddPlateModal, setShowAddPlateModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  const handlePlateAdded = () => {
    setRefreshKey(prev => prev + 1)
    router.refresh()
  }

  return (
    <div className={styles.groupDetail}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
            ← Back
          </button>
          <div className={styles.titleSection}>
            <h1>{group.name}</h1>
            <div className={styles.meta}>
              <div className={styles.codeBadge}>{group.code}</div>
              <span className={styles.memberCount}>{group.member_count} members</span>
            </div>
          </div>
          <button onClick={() => setShowAddPlateModal(true)} className="btn-primary">
            Add Plate
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'map' ? styles.active : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'gallery' ? styles.active : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'leaderboard' && <Leaderboard groupId={group.id} key={refreshKey} />}
        {activeTab === 'map' && <MapView groupId={group.id} userId={userId} key={refreshKey} />}
        {activeTab === 'gallery' && <Gallery groupId={group.id} key={refreshKey} />}
      </div>

      {showAddPlateModal && (
        <AddPlateModal
          groupId={group.id}
          userId={userId}
          onClose={() => setShowAddPlateModal(false)}
          onPlateAdded={handlePlateAdded}
        />
      )}

      {/* Highway Sign */}
      <div className="highway-sign">
        25 Miles to<br />Seattle
      </div>
    </div>
  )
}
