import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaixaClient from './CaixaClient'

export default async function CaixaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: box } = await supabase
    .from('logistics_boxes')
    .select(`
      *,
      section:cache_sections(id, codigo, nome_pt)
    `)
    .eq('id', id)
    .single()

  if (!box) notFound()

  const [
    { data: itensNaCaixa },
    { data: itensDisponiveis },
  ] = await Promise.all([
    // itens já acondicionados nesta caixa
    supabase
      .from('equipment')
      .select(`
        id, codigo_item, nome, status, peso_kg, proprietario,
        section:cache_sections(codigo, nome_pt)
      `)
      .eq('caixa_id', id)
      .order('codigo_item'),
    // itens sem caixa, disponíveis para adicionar (apenas principais)
    supabase
      .from('equipment')
      .select(`
        id, codigo_item, nome, status, peso_kg, proprietario,
        section:cache_sections(codigo, nome_pt)
      `)
      .is('caixa_id', null)
      .is('parent_id', null)
      .order('codigo_item'),
  ])

  return (
    <CaixaClient
      box={box}
      itensIniciais={itensNaCaixa ?? []}
      disponiveisIniciais={itensDisponiveis ?? []}
    />
  )
}
