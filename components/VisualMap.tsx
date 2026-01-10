'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './VisualMap.module.css'

// Simplified coordinate mapping for states/provinces (percentage-based positioning)
const STATE_POSITIONS: { [key: string]: { left: string; top: string; name: string } } = {
  // US States (approximate positions)
  'WA': { left: '8%', top: '12%', name: 'Washington' },
  'OR': { left: '6%', top: '22%', name: 'Oregon' },
  'CA': { left: '4%', top: '38%', name: 'California' },
  'NV': { left: '10%', top: '32%', name: 'Nevada' },
  'ID': { left: '14%', top: '20%', name: 'Idaho' },
  'MT': { left: '18%', top: '14%', name: 'Montana' },
  'WY': { left: '20%', top: '24%', name: 'Wyoming' },
  'UT': { left: '16%', top: '34%', name: 'Utah' },
  'AZ': { left: '14%', top: '44%', name: 'Arizona' },
  'NM': { left: '20%', top: '46%', name: 'New Mexico' },
  'CO': { left: '24%', top: '34%', name: 'Colorado' },
  'ND': { left: '30%', top: '14%', name: 'North Dakota' },
  'SD': { left: '30%', top: '24%', name: 'South Dakota' },
  'NE': { left: '30%', top: '32%', name: 'Nebraska' },
  'KS': { left: '32%', top: '38%', name: 'Kansas' },
  'OK': { left: '32%', top: '46%', name: 'Oklahoma' },
  'TX': { left: '32%', top: '58%', name: 'Texas' },
  'MN': { left: '36%', top: '18%', name: 'Minnesota' },
  'IA': { left: '38%', top: '28%', name: 'Iowa' },
  'MO': { left: '38%', top: '38%', name: 'Missouri' },
  'AR': { left: '38%', top: '48%', name: 'Arkansas' },
  'LA': { left: '38%', top: '58%', name: 'Louisiana' },
  'WI': { left: '42%', top: '22%', name: 'Wisconsin' },
  'IL': { left: '44%', top: '32%', name: 'Illinois' },
  'MI': { left: '48%', top: '24%', name: 'Michigan' },
  'IN': { left: '48%', top: '34%', name: 'Indiana' },
  'OH': { left: '52%', top: '32%', name: 'Ohio' },
  'KY': { left: '50%', top: '40%', name: 'Kentucky' },
  'TN': { left: '48%', top: '46%', name: 'Tennessee' },
  'MS': { left: '42%', top: '52%', name: 'Mississippi' },
  'AL': { left: '48%', top: '52%', name: 'Alabama' },
  'GA': { left: '54%', top: '50%', name: 'Georgia' },
  'FL': { left: '58%', top: '62%', name: 'Florida' },
  'SC': { left: '58%', top: '48%', name: 'South Carolina' },
  'NC': { left: '60%', top: '42%', name: 'North Carolina' },
  'VA': { left: '62%', top: '38%', name: 'Virginia' },
  'WV': { left: '56%', top: '38%', name: 'West Virginia' },
  'MD': { left: '64%', top: '36%', name: 'Maryland' },
  'DE': { left: '66%', top: '36%', name: 'Delaware' },
  'PA': { left: '60%', top: '32%', name: 'Pennsylvania' },
  'NJ': { left: '66%', top: '32%', name: 'New Jersey' },
  'NY': { left: '64%', top: '26%', name: 'New York' },
  'CT': { left: '68%', top: '28%', name: 'Connecticut' },
  'RI': { left: '70%', top: '28%', name: 'Rhode Island' },
  'MA': { left: '70%', top: '26%', name: 'Massachusetts' },
  'VT': { left: '66%', top: '22%', name: 'Vermont' },
  'NH': { left: '68%', top: '22%', name: 'New Hampshire' },
  'ME': { left: '70%', top: '18%', name: 'Maine' },
  'AK': { left: '2%', top: '72%', name: 'Alaska' },
  'HI': { left: '18%', top: '78%', name: 'Hawaii' },
  'DC': { left: '64%', top: '37%', name: 'Washington D.C.' },
  'PR': { left: '70%', top: '72%', name: 'Puerto Rico' },
  'GU': { left: '8%', top: '82%', name: 'Guam' },
  'VI': { left: '68%', top: '74%', name: 'U.S. Virgin Islands' },
  'AS': { left: '6%', top: '80%', name: 'American Samoa' },
  'MP': { left: '10%', top: '84%', name: 'Northern Mariana Islands' },

  // Canadian Provinces
  'BC': { left: '10%', top: '8%', name: 'British Columbia' },
  'AB': { left: '18%', top: '10%', name: 'Alberta' },
  'SK': { left: '24%', top: '10%', name: 'Saskatchewan' },
  'MB': { left: '32%', top: '12%', name: 'Manitoba' },
  'ON': { left: '48%', top: '16%', name: 'Ontario' },
  'QC': { left: '60%', top: '14%', name: 'Quebec' },
  'NB': { left: '68%', top: '16%', name: 'New Brunswick' },
  'NS': { left: '70%', top: '18%', name: 'Nova Scotia' },
  'PE': { left: '70%', top: '16%', name: 'Prince Edward Island' },
  'NL': { left: '72%', top: '10%', name: 'Newfoundland' },
  'YT': { left: '6%', top: '4%', name: 'Yukon' },
  'NT': { left: '16%', top: '4%', name: 'Northwest Territories' },
  'NU': { left: '36%', top: '4%', name: 'Nunavut' }
}

export default function VisualMap({ groupId, userId }: { groupId: string; userId: string }) {
  const [userStates, setUserStates] = useState<Set<string>>(new Set())
  const [otherStates, setOtherStates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStates()

    // Real-time subscription
    const channel = supabase
      .channel(`visual-map-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'license_plates', filter: `group_id=eq.${groupId}` }, loadStates)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId, userId])

  const loadStates = async () => {
    const { data } = await supabase
      .from('license_plates')
      .select('state, user_id')
      .eq('group_id', groupId)

    const yours = new Set<string>()
    const others = new Set<string>()

    data?.forEach((p: any) => {
      if (p.user_id === userId) yours.add(p.state)
      else others.add(p.state)
    })

    setUserStates(yours)
    setOtherStates(others)
    setLoading(false)
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className={styles.visualMap}>
      <h2>📍 Pin Map</h2>
      <div className={styles.legend}>
        <div className={styles.legendItem}><div className={`${styles.pin} ${styles.yours}`}></div><span>You collected</span></div>
        <div className={styles.legendItem}><div className={`${styles.pin} ${styles.others}`}></div><span>Others collected</span></div>
        <div className={styles.legendItem}><div className={`${styles.pin} ${styles.uncollected}`}></div><span>Not collected</span></div>
      </div>

      <div className={styles.mapContainer}>
        {Object.entries(STATE_POSITIONS).map(([code, pos]) => {
          const type = userStates.has(code) ? 'yours' : otherStates.has(code) ? 'others' : 'uncollected'
          return (
            <div
              key={code}
              className={`${styles.mapPin} ${styles[type]}`}
              style={{ left: pos.left, top: pos.top }}
              title={`${pos.name} (${code})`}
            >
              <div className={styles.pinDot}>📍</div>
              <div className={styles.pinLabel}>{code}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
