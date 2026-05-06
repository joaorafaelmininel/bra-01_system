import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MeuPerfilClient from './MeuPerfilClient'

export default async function MeuPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  // Busca membro vinculado ao user_id (se existir)
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <MeuPerfilClient
      user={{ id: user.id, email: user.email ?? '' }}
      profile={{ role: profile?.role ?? 'team_member', display_name: profile?.display_name ?? '' }}
      member={member ?? null}
    />
  )
}
