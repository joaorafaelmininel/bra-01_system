import { createClient } from '@/lib/supabase/server'
import ExconClient from './ExconClient'

export default async function ExconPage() {
  const supabase = await createClient()

  const [
    { data: exconMembers },
    { data: activities },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('excon_members')
      .select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao, componente_primario)')
      .eq('ativo', true)
      .order('created_at'),
    supabase
      .from('excon_activities')
      .select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao)')
      .order('prazo', { ascending: true }),
    supabase
      .from('members')
      .select('id, nome_completo, nome_guerra, posto_graduacao, instituicao, componente_primario')
      .eq('status_operacional', 'Ativo')
      .order('nome_completo'),
  ])

  return (
    <ExconClient
      exconMembers={exconMembers ?? []}
      activities={activities ?? []}
      members={members ?? []}
    />
  )
}
