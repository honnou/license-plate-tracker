'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { LicensePlate } from '@/types'
import styles from './Gallery.module.css'

export default function Gallery({ groupId }: { groupId: string }) {
  const [plates, setPlates] = useState<LicensePlate[]>([])
  const [selectedPlate, setSelectedPlate] = useState<LicensePlate | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPlates()

    // Real-time subscription for new plates
    const channel = supabase
      .channel(`gallery-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'license_plates', filter: `group_id=eq.${groupId}` }, loadPlates)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  const loadPlates = async () => {
    const { data } = await supabase
      .from('license_plates')
      .select('*, profiles(username)')
      .eq('group_id', groupId)
      .order('spotted_at', { ascending: false })

    setPlates(data?.map((p: any) => ({ ...p, username: p.profiles?.username })) || [])
    setLoading(false)
  }

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from('license-plates').getPublicUrl(path)
    return data.publicUrl
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className={styles.gallery}>
      <h2>Photo Gallery</h2>
      {plates.length === 0 ? (
        <div className={styles.empty}>No plates yet. Start adding some!</div>
      ) : (
        <>
          <div className={styles.stats}>
            <span>Total plates: <strong>{plates.length}</strong></span>
            <span>Vanity plates: <strong>{plates.filter(p => p.is_vanity).length}</strong></span>
            <span>Special plates: <strong>{plates.filter(p => p.is_special).length}</strong></span>
          </div>
          <div className={styles.grid}>
            {plates.map(p => (
              <div key={p.id} className={styles.card} onClick={() => setSelectedPlate(p)}>
                <div className={styles.image}>
                  <Image src={getPhotoUrl(p.photo_path)} alt={`${p.state} plate`} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.info}>
                  <div className={styles.state}>{p.state}</div>
                  <div className={styles.user}>{p.username}</div>
                  <div className={styles.badges}>
                    {p.is_vanity && <span className={styles.vanity}>Vanity</span>}
                    {p.is_special && <span className={styles.special}>Special</span>}
                  </div>
                  <div className={styles.points}>{p.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedPlate && (
        <div className={styles.modal} onClick={() => setSelectedPlate(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelectedPlate(null)}>&times;</button>
            <Image src={getPhotoUrl(selectedPlate.photo_path)} alt={selectedPlate.state} width={800} height={500} style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }} />
            <div className={styles.details}>
              <h3>{selectedPlate.state}</h3>
              <p>Spotted by: <strong>{selectedPlate.username}</strong></p>
              <p>Date: {new Date(selectedPlate.spotted_at).toLocaleDateString()}</p>
              {selectedPlate.is_vanity && <p>✨ Vanity Plate</p>}
              {selectedPlate.is_special && <p>⭐ Special Plate{selectedPlate.special_type ? `: ${selectedPlate.special_type}` : ''}</p>}
              <p className={styles.detailPoints}>{selectedPlate.points} points</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
