import { createClient } from '@/lib/supabase/server'
import OrganogramaPrint from './OrganogramaPrint'

export default async function OrganogramaImprimirPage() {
  const supabase = await createClient()

  const [{ data: functions }, { data: designations }] = await Promise.all([
    supabase.from('usar_functions').select('*').order('ordem_organograma'),
    supabase.from('member_usar_functions').select(`
      *,
      member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao, componente_primario, aptidao_operacional, passaporte_validade)
    `),
  ])

  return <OrganogramaPrint functions={functions ?? []} designations={designations ?? []} />
}
