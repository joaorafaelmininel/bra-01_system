import { createClient } from '@/lib/supabase/server'
import RelatoriosClient from './RelatoriosClient'

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const [
    { data: members },
    { data: qualifications },
    { data: languages },
    { data: equipment },
    { data: functions },
    { data: designations },
    { data: vaccines },
    { data: vaccineCatalog },
    { data: missions },
    { count: alertsCount },
  ] = await Promise.all([
    supabase.from('members').select('*, member_usar_functions(function_id, primaria, alternativa)'),
    supabase.from('qualifications').select('*'),
    supabase.from('member_languages').select('*'),
    supabase.from('equipment').select('*, section:cache_sections(codigo, nome_pt)').is('parent_id', null),
    supabase.from('usar_functions').select('*').order('ordem_organograma'),
    supabase.from('member_usar_functions').select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao), function:usar_functions(codigo, nome_pt, componente, requer_ingles)'),
    supabase.from('member_vaccines').select('*'),
    supabase.from('vaccine_catalog').select('*').eq('obrigatoria', true),
    supabase.from('missions').select('id, nome, tipo, fase, data_ativacao').neq('fase','Arquivada').order('data_ativacao', { ascending: false }),
    supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('resolvido', false),
  ])

  return (
    <RelatoriosClient
      members={members ?? []}
      qualifications={qualifications ?? []}
      languages={languages ?? []}
      equipment={equipment ?? []}
      functions={functions ?? []}
      designations={designations ?? []}
      vaccines={vaccines ?? []}
      vaccineCatalog={vaccineCatalog ?? []}
      missions={missions ?? []}
      alertsCount={alertsCount ?? 0}
    />
  )
}
