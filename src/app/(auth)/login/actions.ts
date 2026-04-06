'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LoginState = { error: string } | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
