import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MissaoClient from './MissaoClient'

export default async function MissaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: mission },
    { data: participants },
    { data: equipment },
    { data: checklist },
    { data: members },
    { data: equipmentCatalog },
    { data: usarFunctions },
  ] = await Promise.all([
    supabase.from('missions').select(`*, lider:members(id, nome_guerra, nome_completo, posto_graduacao)`).eq('id', id).single(),
    supabase.from('mission_members').select(`*, member:members(id, nome_guerra, nome_completo, posto_graduacao, componente_primario, instituicao), function:usar_functions(codigo, nome_pt)`).eq('mission_id', id),
    supabase.from('mission_equipment').select(`*, equipment:equipment(id, codigo_item, nome, status, section:cache_sections(codigo, nome_pt))`).eq('mission_id', id),
    supabase.from('deploy_checklist').select('*').eq('mission_id', id).order('created_at'),
    supabase.from('members').select('id, nome_completo, nome_guerra, posto_graduacao, componente_primario').eq('status_operacional', 'Ativo').order('nome_completo'),
    supabase.from('equipment').select('id, codigo_item, nome, status').eq('status', 'Operacional').order('codigo_item'),
    supabase.from('usar_functions').select('id, codigo, nome_pt').order('ordem_organograma'),
  ])

  if (!mission) notFound()

  return (
    <MissaoClient
      mission={mission}
      participants={participants ?? []}
      equipment={equipment ?? []}
      checklist={checklist ?? []}
      members={members ?? []}
      equipmentCatalog={equipmentCatalog ?? []}
      usarFunctions={usarFunctions ?? []}
    />
  )
}
