import { createClient } from '@/lib/supabase/server'
import MembrosClient from './MembrosClient'

export default async function PessoalPage() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('members')
    .select(`
      id,
      nome_completo,
      nome_guerra,
      foto_url,
      posto_graduacao,
      instituicao,
      estado_base,
      componente_primario,
      componente_secundario,
      status_operacional,
      aptidao_operacional,
      tipo_membro,
      email_pessoal,
      passaporte_validade
    `)
    .order('nome_completo')

  if (error) console.error('Erro ao buscar membros:', error)

  return <MembrosClient members={members ?? []} />
}
