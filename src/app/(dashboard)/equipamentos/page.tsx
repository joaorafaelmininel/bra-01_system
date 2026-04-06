import { createClient } from '@/lib/supabase/server'
import EquipamentosClient from './EquipamentosClient'

export default async function EquipamentosPage() {
  const supabase = await createClient()

  const [
    { data: sections },
    { data: equipment },
  ] = await Promise.all([
    supabase.from('cache_sections').select('*, groups:cache_groups(*)').order('codigo'),
    supabase
      .from('equipment')
      .select(`
        id, codigo_item, tipo_item, nome, nome_en,
        fabricante, modelo, numero_serie, numero_patrimonio,
        status, localizacao, periodicidade_manut,
        ultima_manutencao, proxima_manutencao,
        section:cache_sections(codigo, nome_pt),
        group:cache_groups(codigo, nome),
        responsavel:members(nome_guerra, nome_completo, posto_graduacao)
      `)
      .is('parent_id', null)
      .order('codigo_item'),
  ])

  return (
    <EquipamentosClient
      equipment={equipment ?? []}
      sections={sections ?? []}
    />
  )
}
