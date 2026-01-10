import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GroupDetailClient from '@/components/GroupDetailClient'

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verify user is a member of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (!membership) {
    redirect('/dashboard')
  }

  // Fetch group details
  const { data: group } = await supabase
    .from('groups')
    .select('*, profiles!groups_created_by_fkey(username)')
    .eq('id', params.id)
    .single()

  // Fetch member count
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', params.id)

  return (
    <GroupDetailClient
      group={{
        ...group,
        creator_name: group.profiles?.username,
        member_count: count || 0,
      }}
      userId={session.user.id}
    />
  )
}
