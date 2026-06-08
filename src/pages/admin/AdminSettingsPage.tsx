import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { sendTestAdminNotification } from '../../services/notifications'
import { getAdminNotificationEmail, updateAdminNotificationEmail } from '../../services/settings'

const schema = z.object({
  email: z.string().email('Valid email is required'),
})

type SettingsForm = z.infer<typeof schema>

export function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)
  const [testMessage, setTestMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const { data: email, isLoading } = useQuery({
    queryKey: ['admin', 'settings', 'notification-email'],
    queryFn: getAdminNotificationEmail,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    values: { email: email ?? '' },
  })

  const saveMutation = useMutation({
    mutationFn: (data: SettingsForm) => updateAdminNotificationEmail(data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const testMutation = useMutation({
    mutationFn: sendTestAdminNotification,
    onSuccess: (result) => {
      if (result.ok) {
        setTestMessage({
          type: 'ok',
          text: 'Test email sent. Check your inbox (and spam).',
        })
      } else {
        setTestMessage({
          type: 'error',
          text: result.reason || result.error || 'Test failed — see checklist below.',
        })
      }
    },
    onError: (err) => {
      setTestMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not reach edge function',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Order notifications</h2>
        <p className="mb-6 text-sm text-gray-600">
          This email receives a notification every time a customer places a new order.
        </p>

        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <Input
            label="Admin notification email"
            type="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          {success && (
            <p className="text-sm text-green-600">Settings saved successfully.</p>
          )}
          {saveMutation.isError && (
            <p className="text-sm text-red-600">
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : 'Failed to save settings'}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saveMutation.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={testMutation.isPending}
              onClick={() => {
                setTestMessage(null)
                testMutation.mutate()
              }}
            >
              Send test email
            </Button>
          </div>
        </form>

        {testMessage && (
          <p
            className={`mt-4 text-sm ${testMessage.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}
          >
            {testMessage.text}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Email not working? Checklist</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-gray-600">
          <li>
            Deploy edge function <code className="text-xs">notify-admin-order</code> in Supabase
            → Edge Functions
          </li>
          <li>
            Turn off <strong>Verify JWT</strong> for that function (required for guest checkout)
          </li>
          <li>
            Add secrets: <code className="text-xs">RESEND_API_KEY</code>,{' '}
            <code className="text-xs">FROM_EMAIL</code>
          </li>
          <li>
            With Resend test sender <code className="text-xs">onboarding@resend.dev</code>, emails
            only go to the address on your Resend account — use that email above
          </li>
          <li>Run <code className="text-xs">supabase/store-settings.sql</code> in SQL Editor</li>
        </ol>
      </Card>
    </div>
  )
}
