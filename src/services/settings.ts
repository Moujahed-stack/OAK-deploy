import { supabase } from '../lib/supabase'

export async function getAdminNotificationEmail(): Promise<string> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'admin_notification_email')
    .maybeSingle()

  if (error) throw error
  return data?.value ?? ''
}

export async function updateAdminNotificationEmail(email: string): Promise<void> {
  const { error } = await supabase.from('store_settings').upsert({
    key: 'admin_notification_email',
    value: email,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
