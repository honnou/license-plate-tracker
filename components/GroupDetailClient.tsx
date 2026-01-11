'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Group } from '@/types'
import AddPlateModal from './AddPlateModal'
import Leaderboard from './Leaderboard'
import MapView from './MapView'
import Gallery from './Gallery'
import VisualMap from './VisualMap'
import styles from './GroupDetail.module.css'

interface GroupDetailClientProps {
  group: Group
  userId: string
}

type Tab = 'leaderboard' | 'map' | 'gallery' | 'visual-map'

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
          List
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'visual-map' ? styles.active : ''}`}
          onClick={() => setActiveTab('visual-map')}
        >
          Pin Map
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
        {activeTab === 'visual-map' && <VisualMap groupId={group.id} userId={userId} key={refreshKey} />}
        {activeTab === 'gallery' && <Gallery groupId={group.id} userId={userId} key={refreshKey} />}
      </div>

      {showAddPlateModal && (
        <AddPlateModal
          groupId={group.id}
          userId={userId}
          onClose={() => setShowAddPlateModal(false)}
          onPlateAdded={handlePlateAdded}
        />
      )}

      {/* Cars driving on the road - one for each team member (hidden on Gallery tab) */}
      {activeTab !== 'gallery' && Array.from({ length: group.member_count || 1 }).map((_, i) => {
        const carColors = ['🚗', '🚙', '🚕', '🚐', '🚓'] // Different colored/styled cars
        const carEmoji = carColors[i % carColors.length]
        const delay = i * 1.6 // Stagger the cars

        return (
          <div
            key={i}
            className={styles.teamCar}
            style={{
              animationDelay: `${delay}s`,
              filter: `hue-rotate(${i * 72}deg)` // Rotate hue for color variation
            }}
          >
            {carEmoji}
          </div>
        )
      })}
    </div>
  )
}
