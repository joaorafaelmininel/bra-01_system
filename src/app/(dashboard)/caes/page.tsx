import { createClient } from '@/lib/supabase/server'
import CaesClient from './CaesClient'

export default async function CaesPage() {
  const supabase = await createClient()

  const { data: dogs } = await supabase
    .from('search_dogs')
    .select(`
      id, nome, raca, sexo, data_nascimento, microchip, proprietario,
      especialidade, nivel_certificacao, certificacao_validade,
      status_operacional, aptidao_operacional, foto_url,
      proxima_vacina_raiva, proximo_check_vet,
      condutor:members(id, nome_guerra, nome_completo, posto_graduacao)
    `)
    .order('nome')

  return <CaesClient dogs={dogs ?? []} />
}
