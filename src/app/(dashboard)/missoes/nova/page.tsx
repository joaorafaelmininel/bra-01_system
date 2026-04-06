import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NovaMissaoForm from './NovaMissaoForm'

export default async function NovaMissaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: members } = await supabase
    .from('members')
    .select('id, nome_completo, nome_guerra, posto_graduacao, componente_primario')
    .eq('status_operacional', 'Ativo')
    .order('nome_completo')

  return <NovaMissaoForm members={members ?? []} />
}
