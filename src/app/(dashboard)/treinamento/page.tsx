import { createClient } from '@/lib/supabase/server'
import CapacitacaoClient from './CapacitacaoClient'

export default async function CapacitacaoPage() {
  const supabase = await createClient()

  const [
    { data: members },
    { data: qualifications },
    { data: additionalTraining },
    { data: languages },
    { data: courseCatalog },
    { data: usarFunctions },
  ] = await Promise.all([
    supabase
      .from('members')
      .select('id, nome_completo, nome_guerra, posto_graduacao, instituicao, componente_primario, status_operacional')
      .eq('status_operacional', 'Ativo')
      .order('nome_completo'),
    supabase
      .from('qualifications')
      .select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao)')
      .order('data_conclusao', { ascending: false }),
    supabase
      .from('additional_training')
      .select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao)')
      .order('data_inicio', { ascending: false }),
    supabase
      .from('member_languages')
      .select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao)')
      .order('idioma'),
    supabase
      .from('course_catalog')
      .select('*')
      .order('nome'),
    supabase
      .from('usar_functions')
      .select('id, codigo, nome_pt, requer_ingles')
      .eq('requer_ingles', true),
  ])

  return (
    <CapacitacaoClient
      members={members ?? []}
      qualifications={qualifications ?? []}
      additionalTraining={additionalTraining ?? []}
      languages={languages ?? []}
      courseCatalog={courseCatalog ?? []}
      usarFunctionsRequiringEnglish={usarFunctions ?? []}
    />
  )
}
