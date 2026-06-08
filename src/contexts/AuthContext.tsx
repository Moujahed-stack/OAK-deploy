import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { checkIsAdmin, fetchProfile } from '../services/auth'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      setIsAdmin(false)
      return
    }

    const [profileData, adminStatus] = await Promise.all([
      fetchProfile(currentUser.id),
      checkIsAdmin(currentUser.id),
    ])
    setProfile(profileData)
    setIsAdmin(adminStatus)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user)
  }, [user, loadUserData])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      loadUserData(currentUser).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      loadUserData(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [loadUserData])

  const value = useMemo(
    () => ({ user, profile, isAdmin, loading, refreshProfile }),
    [user, profile, isAdmin, loading, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
