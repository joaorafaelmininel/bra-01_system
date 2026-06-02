import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaoForm from '../../CaoForm'

export default async function EditarCaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: dog }, { data: members }] = await Promise.all([
    supabase.from('search_dogs').select('*').eq('id', id).single(),
    supabase.from('members').select('id, nome_completo, nome_guerra, posto_graduacao').eq('status_operacional', 'Ativo').order('nome_completo'),
  ])

  if (!dog) notFound()

  return <CaoForm members={members ?? []} dog={dog} />
}
