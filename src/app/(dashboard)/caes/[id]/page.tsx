import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaoDetalheClient from './CaoDetalheClient'

export default async function CaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dog } = await supabase
    .from('search_dogs')
    .select(`
      *,
      condutor:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao)
    `)
    .eq('id', id)
    .single()

  if (!dog) notFound()

  return <CaoDetalheClient dog={dog} />
}
