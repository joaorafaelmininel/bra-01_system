import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditarEquipamentoForm from './EditarEquipamentoForm'

export default async function EditarEquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: item },
    { data: sections },
    { data: groups },
    { data: members },
    { data: parentItems },
  ] = await Promise.all([
    supabase.from('equipment').select('*').eq('id', id).single(),
    supabase.from('cache_sections').select('*').order('codigo'),
    supabase.from('cache_groups').select('*, section:cache_sections(codigo, nome_pt)').order('codigo'),
    supabase.from('members').select('id, nome_completo, nome_guerra, posto_graduacao').eq('status_operacional', 'Ativo').order('nome_completo'),
    supabase.from('equipment').select('id, codigo_item, nome').is('parent_id', null).neq('id', id).order('codigo_item'),
  ])

  if (!item) notFound()

  return (
    <EditarEquipamentoForm
      item={item}
      sections={sections ?? []}
      groups={groups ?? []}
      members={members ?? []}
      parentItems={parentItems ?? []}
    />
  )
}
