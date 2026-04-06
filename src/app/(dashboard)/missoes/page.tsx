import { createClient } from '@/lib/supabase/server'
import MissoesClient from './MissoesClient'

export default async function MissoesPage() {
  const supabase = await createClient()

  const { data: missions } = await supabase
    .from('missions')
    .select(`
      id, nome, codigo, tipo, fase, pais, cidade,
      data_ativacao, data_retorno, created_at,
      lider:members(nome_guerra, nome_completo, posto_graduacao),
      mission_members(count)
    `)
    .order('created_at', { ascending: false })

  return <MissoesClient missions={missions ?? []} />
}
