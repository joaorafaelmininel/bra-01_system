import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditarMembroForm from './EditarMembroForm'

export default async function EditarMembroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (!member) notFound()

  return <EditarMembroForm member={member} />
}
