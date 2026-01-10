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

  // Fetch group details first
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!group) {
    redirect('/dashboard')
  }

  // Verify user is a member of this group OR is the creator
  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.id)
    .eq('user_id', session.user.id)
    .single()

  const isCreator = (group as any).created_by === session.user.id

  if (!membership && !isCreator) {
    redirect('/dashboard')
  }

  // Fetch creator profile
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', (group as any).created_by)
    .single()

  // Fetch member count
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', params.id)

  const groupData = group as any

  return (
    <GroupDetailClient
      group={{
        id: groupData.id,
        name: groupData.name,
        code: groupData.code,
        created_by: groupData.created_by,
        created_at: groupData.created_at,
        creator_name: creatorProfile?.username,
        member_count: count || 0,
      }}
      userId={session.user.id}
    />
  )
}
