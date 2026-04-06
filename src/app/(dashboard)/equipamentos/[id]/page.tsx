import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EquipamentoClient from './EquipamentoClient'

export default async function EquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: item },
    { data: subcomponents },
    { data: maintenanceLogs },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('equipment')
      .select(`
        *,
        section:cache_sections(codigo, nome_pt),
        group:cache_groups(codigo, nome),
        responsavel:members(id, nome_guerra, nome_completo, posto_graduacao),
        parent:equipment!parent_id(id, codigo_item, nome)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('equipment')
      .select('*')
      .eq('parent_id', id)
      .order('codigo_item'),
    supabase
      .from('maintenance_log')
      .select('*, responsavel:members(nome_guerra, nome_completo)')
      .eq('equipment_id', id)
      .order('data_inicio', { ascending: false }),
    supabase
      .from('members')
      .select('id, nome_completo, nome_guerra, posto_graduacao')
      .eq('status_operacional', 'Ativo')
      .order('nome_completo'),
  ])

  if (!item) notFound()

  return (
    <EquipamentoClient
      item={item}
      subcomponents={subcomponents ?? []}
      maintenanceLogs={maintenanceLogs ?? []}
      members={members ?? []}
    />
  )
}
