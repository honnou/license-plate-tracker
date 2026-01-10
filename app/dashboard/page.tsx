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
    .select('*, profiles!groups_created_by_fkey(username)')
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  const formattedGroups = groups?.map((g: any) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    created_by: g.created_by,
    created_at: g.created_at,
    creator_name: g.profiles?.username,
  })) || []

  const username = (profile as { username: string } | null)?.username || session.user.email?.split('@')[0] || 'User'

  return (
    <DashboardClient
      groups={formattedGroups}
      username={username}
    />
  )
}
