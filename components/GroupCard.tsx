'use client'

import Link from 'next/link'
import { Group } from '@/types'
import styles from './GroupCard.module.css'

interface GroupCardProps {
  group: Group
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`} className={styles.groupCard}>
      <div className={styles.groupHeader}>
        <h3>{group.name}</h3>
        <div className={styles.groupCode}>{group.code}</div>
      </div>
      <div className={styles.groupInfo}>
        <p>Created by: {group.creator_name || 'Unknown'}</p>
        <p className={styles.date}>
          {new Date(group.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}
