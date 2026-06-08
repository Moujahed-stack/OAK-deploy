import { Badge } from './ui/Badge'
import type { OrderStatus } from '../types'

const statusVariant: Record<OrderStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  completed: 'success',
  rejected: 'danger',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
