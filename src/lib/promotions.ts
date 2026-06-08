import type { Promotion } from '../types'

export interface PromotionContext {
  subtotal: number
  isFirstOrder: boolean
  isRegistered: boolean
  totalSpent: number
}

export interface PromotionResult {
  discount: number
  appliedPromotion: Promotion | null
}

export function calculateBestDiscount(
  promotions: Promotion[],
  context: PromotionContext
): PromotionResult {
  let bestDiscount = 0
  let appliedPromotion: Promotion | null = null

  for (const promo of promotions) {
    if (!promo.active) continue
    if (promo.registered_users_only && !context.isRegistered) continue
    if (promo.first_order_only && !context.isFirstOrder) continue
    if (promo.min_total_spent != null && context.totalSpent < promo.min_total_spent) continue
    if (promo.min_order_amount != null && context.subtotal < promo.min_order_amount) continue

    let discount = 0
    if (promo.discount_type === 'percentage') {
      discount = context.subtotal * (promo.discount_value / 100)
    } else {
      discount = promo.discount_value
    }
    discount = Math.min(discount, context.subtotal)

    if (discount > bestDiscount) {
      bestDiscount = discount
      appliedPromotion = promo
    }
  }

  return { discount: Math.round(bestDiscount * 100) / 100, appliedPromotion }
}

export function formatDiscountLabel(promo: Promotion): string {
  if (promo.discount_type === 'percentage') {
    return `${promo.discount_value}% off`
  }
  return `$${promo.discount_value.toFixed(2)} off`
}
