import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string }

export async function signUp(
  email: string,
  password: string,
  metadata?: { firstName?: string; lastName?: string },
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' }
  }

  const supabase = getSupabase()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: metadata?.firstName,
        last_name: metadata?.lastName,
        display_name: [metadata?.firstName, metadata?.lastName].filter(Boolean).join(' ') || undefined,
      },
    },
  })

  if (error) return { ok: false, message: error.message }
  return { ok: true }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' }
  }

  const { error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) return { ok: false, message: error.message }
  return { ok: true }
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' }
  }

  const { error } = await getSupabase().auth.signOut()
  if (error) return { ok: false, message: error.message }
  return { ok: true }
}
