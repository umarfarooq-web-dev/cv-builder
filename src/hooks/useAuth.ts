import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import type { ProfileRow } from '../types/database'

type AuthState = {
  loading: boolean
  session: Session | null
  user: User | null
  profile: ProfileRow | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    loading: isSupabaseConfigured(),
    session: null,
    user: null,
    profile: null,
  })

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ loading: false, session: null, user: null, profile: null })
      return
    }

    const supabase = getSupabase()

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      return data as ProfileRow | null
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = session?.user ? await loadProfile(session.user.id) : null
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        profile,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session?.user ? await loadProfile(session.user.id) : null
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        profile,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
