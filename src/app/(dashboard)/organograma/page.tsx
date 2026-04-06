import { createClient } from '@/lib/supabase/server'
import OrganogramaClient from './OrganogramaClient'

export default async function OrganogramaPage() {
  const supabase = await createClient()

  const [
    { data: functions },
    { data: designations },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('usar_functions')
      .select('*')
      .order('ordem_organograma'),
    supabase
      .from('member_usar_functions')
      .select(`
        *,
        member:members(
          id, nome_guerra, nome_completo,
          posto_graduacao, instituicao,
          componente_primario, status_operacional,
          aptidao_operacional, passaporte_validade
        )
      `),
    supabase
      .from('members')
      .select('id, nome_completo, nome_guerra, posto_graduacao, instituicao, componente_primario, status_operacional, aptidao_operacional')
      .eq('status_operacional', 'Ativo')
      .order('nome_completo'),
  ])

  return (
    <OrganogramaClient
      functions={functions ?? []}
      designations={designations ?? []}
      members={members ?? []}
    />
  )
}
