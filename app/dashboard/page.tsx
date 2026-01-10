import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user's groups (RLS policy handles filtering)
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  // Fetch creator profiles for all groups
  const creatorIds = groups?.map((g: any) => g.created_by).filter(Boolean) || []
  const { data: creatorProfiles } = creatorIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username')
        .in('id', creatorIds)
    : { data: [] }

  const profileMap = new Map((creatorProfiles || []).map((p: any) => [p.id, p.username]))

  const formattedGroups = groups?.map((g: any) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    created_by: g.created_by,
    created_at: g.created_at,
    creator_name: profileMap.get(g.created_by),
  })) || []

  const username = (profile as { username: string } | null)?.username || session.user.email?.split('@')[0] || 'User'

  return (
    <DashboardClient
      groups={formattedGroups}
      username={username}
    />
  )
}
