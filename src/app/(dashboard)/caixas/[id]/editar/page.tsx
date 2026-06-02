import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditarCaixaForm from './EditarCaixaForm'

export default async function EditarCaixaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: box }, { data: sections }] = await Promise.all([
    supabase.from('logistics_boxes').select('*').eq('id', id).single(),
    supabase.from('cache_sections').select('id, codigo, nome_pt').order('codigo'),
  ])

  if (!box) notFound()

  return <EditarCaixaForm box={box} sections={sections ?? []} />
}
