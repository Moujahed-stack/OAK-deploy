import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  product_name: string
  color: string
  size: string
  quantity: number
  unit_price: number
}

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const url = new URL(req.url)
  if (url.searchParams.get('test') === 'true') {
    return { test: true }
  }

  if (req.method === 'GET') {
    return {}
  }

  try {
    const text = await req.text()
    if (!text) return {}
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

function isTestRequest(body: Record<string, unknown>): boolean {
  return body.test === true || body.test === 'true' || body.mode === 'test'
}

async function getAdminEmail(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data: setting } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'admin_notification_email')
    .maybeSingle()

  return (
    setting?.value?.trim() ||
    Deno.env.get('ADMIN_NOTIFICATION_EMAIL')?.trim() ||
    ''
  )
}

async function sendEmail(params: {
  resendApiKey: string
  fromEmail: string
  to: string
  subject: string
  html: string
}): Promise<void> {
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.fromEmail,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    throw new Error(`Resend error: ${errBody}`)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await parseBody(req)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'OAK Clothing <onboarding@resend.dev>'

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables on edge function')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const adminEmail = await getAdminEmail(supabase)

    if (!adminEmail) {
      return json({ ok: false, skipped: true, reason: 'No admin notification email configured' })
    }

    if (!resendApiKey) {
      return json({ ok: false, skipped: true, reason: 'RESEND_API_KEY secret not set in Supabase' })
    }

    if (isTestRequest(body)) {
      await sendEmail({
        resendApiKey,
        fromEmail,
        to: adminEmail,
        subject: 'OAK — test order notification',
        html: `
          <h2>Test email</h2>
          <p>If you received this, order notifications are configured correctly.</p>
          <p><strong>Note:</strong> When using <code>onboarding@resend.dev</code> as the sender,
          Resend only delivers to the email address on your Resend account.</p>
        `,
      })
      return json({ ok: true })
    }

    const orderId = (body.orderId ?? body.order_id) as string | undefined
    if (!orderId) {
      throw new Error('orderId is required (or use test: true for a test email)')
    }

    await new Promise((r) => setTimeout(r, 300))

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message ?? orderId}`)
    }

    const items = (order.order_items as OrderItem[]) || []
    const itemsHtml = items.length
      ? items
          .map(
            (item) =>
              `<li>${item.product_name} — ${item.color} / ${item.size} × ${item.quantity} ($${Number(item.unit_price).toFixed(2)} each)</li>`
          )
          .join('')
      : '<li>(no items)</li>'

    await sendEmail({
      resendApiKey,
      fromEmail,
      to: adminEmail,
      subject: `New order #${String(orderId).slice(0, 8)} — $${Number(order.total_price).toFixed(2)}`,
      html: `
        <h2>New order received</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Subtotal:</strong> $${Number(order.subtotal).toFixed(2)}</p>
        <p><strong>Discount:</strong> $${Number(order.discount).toFixed(2)}</p>
        <p><strong>Total:</strong> $${Number(order.total_price).toFixed(2)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h3>Items</h3>
        <ul>${itemsHtml}</ul>
      `,
    })

    return json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ ok: false, error: message }, 500)
  }
})

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
