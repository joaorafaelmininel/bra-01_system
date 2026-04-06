import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NovoEquipamentoForm from './NovoEquipamentoForm'

export default async function NovoEquipamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: sections },
    { data: groups },
    { data: members },
    { data: equipment },
  ] = await Promise.all([
    supabase.from('cache_sections').select('*').order('codigo'),
    supabase.from('cache_groups').select('*, section:cache_sections(codigo, nome_pt)').order('codigo'),
    supabase.from('members').select('id, nome_completo, nome_guerra, posto_graduacao').eq('status_operacional', 'Ativo').order('nome_completo'),
    supabase.from('equipment').select('id, codigo_item, nome').is('parent_id', null).order('codigo_item'),
  ])

  return (
    <NovoEquipamentoForm
      sections={sections ?? []}
      groups={groups ?? []}
      members={members ?? []}
      parentItems={equipment ?? []}
    />
  )
}
