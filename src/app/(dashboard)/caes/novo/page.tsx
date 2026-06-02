import { createClient } from '@/lib/supabase/server'
import CaoForm from '../CaoForm'

export default async function NovoCaoPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, nome_completo, nome_guerra, posto_graduacao')
    .eq('status_operacional', 'Ativo')
    .order('nome_completo')

  return <CaoForm members={members ?? []} />
}
