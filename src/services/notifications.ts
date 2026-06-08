export interface NotificationResult {
  ok: boolean
  skipped?: boolean
  reason?: string
  error?: string
}

function getSupabaseKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  )
}

async function callNotifyFunction(body: Record<string, unknown>): Promise<NotificationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const apiKey = getSupabaseKey()

  if (!supabaseUrl || !apiKey) {
    return { ok: false, error: 'Missing Supabase URL or API key in .env' }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/notify-admin-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      apikey: apiKey,
    },
    body: JSON.stringify(body),
  })

  let payload: NotificationResult = { ok: false }
  try {
    payload = (await response.json()) as NotificationResult
  } catch {
    payload = { ok: false, error: `HTTP ${response.status}` }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error || payload.reason || `HTTP ${response.status}`,
      skipped: payload.skipped,
      reason: payload.reason,
    }
  }

  if (payload.skipped) {
    return { ok: false, skipped: true, reason: payload.reason }
  }

  if (payload.error) {
    return { ok: false, error: payload.error }
  }

  return { ok: payload.ok !== false }
}

export async function notifyAdminNewOrder(orderId: string): Promise<NotificationResult> {
  if (!orderId) {
    return { ok: false, error: 'orderId is missing on client' }
  }

  const result = await callNotifyFunction({ orderId })
  if (!result.ok) {
    console.warn('Admin order notification:', result)
  }
  return result
}

export async function sendTestAdminNotification(): Promise<NotificationResult> {
  return callNotifyFunction({ test: true })
}
