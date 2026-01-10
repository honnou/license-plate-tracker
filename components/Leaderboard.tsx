'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/types'
import styles from './Leaderboard.module.css'

export default function Leaderboard({ groupId }: { groupId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()

    // Real-time subscription
    const channel = supabase
      .channel(`leaderboard-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'license_plates', filter: `group_id=eq.${groupId}` }, loadLeaderboard)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  const loadLeaderboard = async () => {
    const { data: plates } = await supabase
      .from('license_plates')
      .select('user_id, state, points, profiles(username)')
      .eq('group_id', groupId)

    const stats = plates?.reduce((acc: any, plate: any) => {
      const userId = plate.user_id
      if (!acc[userId]) {
        acc[userId] = { user_id: userId, username: plate.profiles?.username, states: new Set(), points: 0 }
      }
      acc[userId].states.add(plate.state)
      acc[userId].points += plate.points
      return acc
    }, {})

    const entries: LeaderboardEntry[] = Object.values(stats || {}).map((s: any, i) => ({
      user_id: s.user_id,
      username: s.username,
      states_collected: s.states.size,
      total_points: s.points,
      rank: i + 1,
      states_remaining: 56 - s.states.size
    })).sort((a: any, b: any) => b.total_points - a.total_points || b.states_collected - a.states_collected)

    entries.forEach((e, i) => e.rank = i + 1)
    setLeaderboard(entries)
    setLoading(false)
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className={styles.leaderboard}>
      <h2>Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <div className={styles.empty}>No plates logged yet. Be the first!</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.header}>
            <div>Rank</div><div>Player</div><div>States</div><div>Remaining</div><div>Points</div>
          </div>
          {leaderboard.map(e => (
            <div key={e.user_id} className={`${styles.row} ${styles[`rank${e.rank}`]}`}>
              <div className={styles.rank}>{e.rank === 1 ? '👑' : e.rank}</div>
              <div className={styles.player}>{e.username}</div>
              <div>{e.states_collected}</div>
              <div>{e.states_remaining}</div>
              <div className={styles.points}>{e.total_points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
