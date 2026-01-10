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

  // Fetch user's groups
  const { data: groups } = await supabase
    .from('group_members')
    .select(`
      groups (
        id,
        name,
        code,
        created_by,
        created_at,
        profiles!groups_created_by_fkey (username)
      )
    `)
    .eq('user_id', session.user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  const formattedGroups = groups?.map((g: any) => ({
    id: g.groups.id,
    name: g.groups.name,
    code: g.groups.code,
    created_by: g.groups.created_by,
    created_at: g.groups.created_at,
    creator_name: g.groups.profiles?.username,
  })) || []

  const username = profile?.username || session.user.email?.split('@')[0] || 'User'

  return (
    <DashboardClient
      groups={formattedGroups}
      username={username}
    />
  )
}
