import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/auth'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await updateProfile(user.id, data)
      await refreshProfile()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">My Profile</h1>
      <Card>
        <p className="mb-4 text-sm text-gray-500">Email: {user?.email}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Phone Number" error={errors.phone?.message} {...register('phone')} />
          <Textarea label="Address" rows={3} error={errors.address?.message} {...register('address')} />
          {success && <p className="text-sm text-green-600">Profile updated successfully.</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
