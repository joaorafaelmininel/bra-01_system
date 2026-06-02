import { createClient } from '@/lib/supabase/server'
import CaixasClient from './CaixasClient'

export default async function CaixasPage() {
  const supabase = await createClient()

  const [
    { data: sections },
    { data: boxes },
  ] = await Promise.all([
    supabase.from('cache_sections').select('id, codigo, nome_pt').order('codigo'),
    supabase
      .from('logistics_boxes')
      .select(`
        id, codigo, nome, descricao, tipo, proprietario,
        localizacao, peso_vazio_kg, cor_etiqueta, status, observacao,
        section:cache_sections(codigo, nome_pt),
        itens:equipment(count)
      `)
      .order('codigo'),
  ])

  return (
    <CaixasClient
      boxes={boxes ?? []}
      sections={sections ?? []}
    />
  )
}
