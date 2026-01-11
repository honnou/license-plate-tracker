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
        {/* SVG Boundary Lines */}
        <svg className={styles.boundaryLines} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Canada-US Border */}
          <line x1="5" y1="15" x2="75" y2="15" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* US State Boundaries - Vertical divisions */}
          <line x1="12" y1="15" x2="12" y2="65" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="22" y1="15" x2="22" y2="65" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="35" y1="15" x2="35" y2="65" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="46" y1="15" x2="46" y2="65" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="55" y1="15" x2="55" y2="65" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />

          {/* US State Boundaries - Horizontal divisions */}
          <line x1="5" y1="30" x2="70" y2="30" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="10" y1="42" x2="65" y2="42" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="15" y1="54" x2="60" y2="54" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />

          {/* Canadian Province Boundaries - Vertical */}
          <line x1="14" y1="5" x2="14" y2="15" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="22" y1="5" x2="22" y2="15" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="30" y1="5" x2="30" y2="15" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="42" y1="5" x2="42" y2="15" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />
          <line x1="55" y1="5" x2="55" y2="15" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.2" />

          {/* Coastal outlines (simplified) */}
          <path d="M 5 15 L 5 65 L 15 70 L 60 70 L 70 65 L 70 30"
                stroke="rgba(70, 130, 180, 0.4)"
                strokeWidth="0.4"
                fill="none" />
          <path d="M 5 5 L 5 15 M 70 5 L 70 15"
                stroke="rgba(70, 130, 180, 0.4)"
                strokeWidth="0.4"
                fill="none" />
        </svg>

        {/* State/Province Pins */}
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
