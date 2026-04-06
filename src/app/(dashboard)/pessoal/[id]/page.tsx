import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PerfilClient from './PerfilClient'

export default async function PerfilMembroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: member },
    { data: qualifications },
    { data: vaccines },
    { data: languages },
    { data: functions },
    { data: vaccineCatalog },
    { data: usarFunctionsCatalog },
  ] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase.from('qualifications').select('*').eq('member_id', id).order('data_conclusao', { ascending: false }),
    supabase.from('member_vaccines').select('*, vaccine:vaccine_catalog(nome, periodicidade, obrigatoria)').eq('member_id', id),
    supabase.from('member_languages').select('*').eq('member_id', id),
    supabase.from('member_usar_functions').select('*, function:usar_functions(codigo, nome_pt, nome_en, componente)').eq('member_id', id),
    supabase.from('vaccine_catalog').select('*').order('nome'),
    supabase.from('usar_functions').select('*').order('ordem_organograma'),
  ])

  if (!member) notFound()

  return (
    <PerfilClient
      member={member}
      qualifications={qualifications ?? []}
      vaccines={vaccines ?? []}
      languages={languages ?? []}
      functions={functions ?? []}
      vaccineCatalog={vaccineCatalog ?? []}
      usarFunctionsCatalog={usarFunctionsCatalog ?? []}
    />
  )
}
