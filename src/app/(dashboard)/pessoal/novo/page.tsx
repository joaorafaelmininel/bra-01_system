import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NovoMembroForm from './NovoMembroForm'

export default async function NovoMembroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NovoMembroForm />
}
