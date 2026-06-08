import { supabase } from '../lib/supabase'
import type { Promotion } from '../types'

function parsePromotion(row: Record<string, unknown>): Promotion {
  return {
    ...row,
    discount_value: Number(row.discount_value),
    min_total_spent: row.min_total_spent != null ? Number(row.min_total_spent) : null,
    min_order_amount: row.min_order_amount != null ? Number(row.min_order_amount) : null,
  } as Promotion
}

export async function fetchActivePromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)

  if (error) throw error
  return (data || []).map(parsePromotion)
}

export async function fetchAllPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(parsePromotion)
}

export interface PromotionInput {
  name: string
  active: boolean
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_total_spent: number | null
  min_order_amount: number | null
  first_order_only: boolean
  registered_users_only: boolean
}

export async function createPromotion(input: PromotionInput): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return parsePromotion(data)
}

export async function updatePromotion(id: string, input: Partial<PromotionInput>): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return parsePromotion(data)
}

export async function togglePromotion(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('promotions').update({ active }).eq('id', id)
  if (error) throw error
}
