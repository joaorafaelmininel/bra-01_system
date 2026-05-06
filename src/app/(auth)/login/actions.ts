'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) redirect('/login?error=1')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email       = formData.get('email') as string
  const password    = formData.get('password') as string
  const displayName = formData.get('display_name') as string

  if (!email || !password || !displayName) {
    redirect('/register?error=missing_fields')
  }

  if (password.length < 8) {
    redirect('/register?error=weak_password')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      redirect('/register?error=already_exists')
    }
    redirect('/register?error=1')
  }

  // Cria profile com role team_member
  if (data.user) {
    await supabase.from('profiles').upsert({
      id:           data.user.id,
      role:         'team_member',
      display_name: displayName,
    })
  }

  redirect('/register?success=1')
}
