import { createClient } from '@/lib/supabase/server'
import NovaCaixaForm from './NovaCaixaForm'

export default async function NovaCaixaPage() {
  const supabase = await createClient()
  const { data: sections } = await supabase
    .from('cache_sections')
    .select('id, codigo, nome_pt')
    .order('codigo')

  return <NovaCaixaForm sections={sections ?? []} />
}
