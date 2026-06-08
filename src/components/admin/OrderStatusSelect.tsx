import { useEffect, useState } from 'react'
import { Select } from '../ui/Select'
import type { OrderStatus } from '../../types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
]

interface OrderStatusSelectProps {
  orderId: string
  status: OrderStatus
  onUpdate: (orderId: string, status: OrderStatus) => Promise<void>
  compact?: boolean
}

export function OrderStatusSelect({
  orderId,
  status,
  onUpdate,
  compact = false,
}: OrderStatusSelectProps) {
  const [value, setValue] = useState(status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setValue(status)
  }, [status])

  const handleChange = async (next: OrderStatus) => {
    setValue(next)
    setSaving(true)
    setError('')
    try {
      await onUpdate(orderId, next)
    } catch (err) {
      setValue(status)
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={compact ? 'min-w-[130px]' : ''}>
      <Select
        label={compact ? undefined : 'Order status'}
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        options={STATUS_OPTIONS}
        className={compact ? 'text-xs' : ''}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {saving && <p className="mt-1 text-xs text-gray-500">Saving…</p>}
    </div>
  )
}
