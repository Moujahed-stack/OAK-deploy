import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { formatDiscountLabel } from '../../lib/promotions'
import {
  createPromotion,
  fetchAllPromotions,
  togglePromotion,
  updatePromotion,
  type PromotionInput,
} from '../../services/promotions'
import type { Promotion } from '../../types'

const promotionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  active: z.boolean(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(0.01),
  min_total_spent: z.coerce.number().optional().nullable(),
  min_order_amount: z.coerce.number().optional().nullable(),
  first_order_only: z.boolean(),
  registered_users_only: z.boolean(),
})

type PromotionForm = z.infer<typeof promotionSchema>

function toFormValues(promo?: Promotion): PromotionForm {
  return {
    name: promo?.name || '',
    active: promo?.active ?? true,
    discount_type: promo?.discount_type || 'percentage',
    discount_value: promo?.discount_value || 10,
    min_total_spent: promo?.min_total_spent ?? undefined,
    min_order_amount: promo?.min_order_amount ?? undefined,
    first_order_only: promo?.first_order_only ?? false,
    registered_users_only: promo?.registered_users_only ?? false,
  }
}

function toPromotionInput(data: PromotionForm): PromotionInput {
  return {
    name: data.name,
    active: data.active,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_total_spent: data.min_total_spent || null,
    min_order_amount: data.min_order_amount || null,
    first_order_only: data.first_order_only,
    registered_users_only: data.registered_users_only,
  }
}

export function AdminPromotionsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: fetchAllPromotions,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: toFormValues(),
  })

  const saveMutation = useMutation({
    mutationFn: (data: PromotionForm) => {
      const input = toPromotionInput(data)
      return editing ? updatePromotion(editing.id, input) : createPromotion(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      setShowForm(false)
      setEditing(null)
      reset(toFormValues())
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      togglePromotion(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
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
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Promotions</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditing(null)
            reset(toFormValues())
            setShowForm(true)
          }}
        >
          Add Promotion
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? 'Edit Promotion' : 'New Promotion'}
          </h2>
          <form
            onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Select
              label="Discount Type"
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
              {...register('discount_type')}
            />
            <Input
              label="Discount Value"
              type="number"
              step="0.01"
              error={errors.discount_value?.message}
              {...register('discount_value')}
            />
            <Input
              label="Min Lifetime Spending (optional)"
              type="number"
              step="0.01"
              {...register('min_total_spent')}
            />
            <Input
              label="Min Order Amount (optional)"
              type="number"
              step="0.01"
              {...register('min_order_amount')}
            />
            <div className="space-y-2 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('first_order_only')} />
                First order only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('registered_users_only')} />
                Registered users only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('active')} />
                Active
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={saveMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions?.map((promo) => (
          <Card key={promo.id}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{promo.name}</h3>
              <Badge variant={promo.active ? 'success' : 'default'}>
                {promo.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="mt-2 text-lg font-bold text-brand-700">{formatDiscountLabel(promo)}</p>
            <ul className="mt-3 space-y-1 text-xs text-gray-500">
              {promo.min_total_spent != null && (
                <li>Min lifetime spending: ${promo.min_total_spent}</li>
              )}
              {promo.min_order_amount != null && (
                <li>Min order amount: ${promo.min_order_amount}</li>
              )}
              {promo.first_order_only && <li>First order only</li>}
              {promo.registered_users_only && <li>Registered users only</li>}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(promo)
                  reset(toFormValues(promo))
                  setShowForm(true)
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleMutation.mutate({ id: promo.id, active: !promo.active })}
              >
                {promo.active ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
