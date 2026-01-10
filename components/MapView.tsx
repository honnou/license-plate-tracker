'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { US_STATES } from '@/types'
import styles from './MapView.module.css'

export default function MapView({ groupId, userId }: { groupId: string; userId: string }) {
  const [userStates, setUserStates] = useState<Set<string>>(new Set())
  const [otherStates, setOtherStates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStates()
  }, [groupId, userId])

  const loadStates = async () => {
    const { data } = await supabase
      .from('license_plates')
      .select('state, user_id')
      .eq('group_id', groupId)

    const yours = new Set<string>()
    const others = new Set<string>()

    data?.forEach(p => {
      if (p.user_id === userId) yours.add(p.state)
      else others.add(p.state)
    })

    setUserStates(yours)
    setOtherStates(others)
    setLoading(false)
  }

  if (loading) return <div className="loading">Loading...</div>

  const collected = userStates.size
  const remaining = US_STATES.length - collected

  return (
    <div className={styles.mapView}>
      <h2>State Collection Map</h2>
      <div className={styles.stats}>
        <div><div className={styles.statValue}>{collected}</div><div className={styles.statLabel}>Collected</div></div>
        <div><div className={styles.statValue}>{remaining}</div><div className={styles.statLabel}>Remaining</div></div>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.yours}`}></div><span>You collected</span></div>
        <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.others}`}></div><span>Others collected</span></div>
        <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.uncollected}`}></div><span>Not collected</span></div>
      </div>
      <div className={styles.grid}>
        {US_STATES.map(s => {
          const type = userStates.has(s.code) ? 'yours' : otherStates.has(s.code) ? 'others' : 'uncollected'
          return (
            <div key={s.code} className={`${styles.card} ${styles[type]}`}>
              <div className={styles.code}>{s.code}</div>
              <div className={styles.name}>{s.name}</div>
              {type !== 'uncollected' && <div className={styles.check}>✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
