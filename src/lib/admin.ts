import { supabase } from './supabase'

export async function ensureAdminSession(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) throw error
  if (!session?.user) {
    throw new Error('You are not signed in. Please sign in again.')
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (adminError) throw adminError
  if (!adminRow) {
    throw new Error(
      'Your account is not in the admins table. Run seed-admin.sql or add your user ID to admins.'
    )
  }

  return session.user.id
}
