import { createClient } from '@/lib/supabase/server'
import PainelClient from './PainelClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: members },
    { count: activeAlerts },
  ] = await Promise.all([
    supabase
      .from('members')
      .select('id, instituicao, status_operacional, aptidao_operacional')
      .order('nome_completo'),
    supabase
      .from('system_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolvido', false),
  ])

  return (
    <PainelClient
      members={members ?? []}
      activeAlerts={activeAlerts ?? 0}
    />
  )
}
