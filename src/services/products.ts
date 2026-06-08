import { supabase } from '../lib/supabase'
import type { ProductCategoryId } from '../lib/categories'
import type { Product } from '../types'

export interface ProductFilters {
  category?: ProductCategoryId | ''
  size?: string
}

function parseProduct(row: Record<string, unknown>): Product {
  return {
    ...row,
    price: Number(row.price),
    category: (row.category as Product['category']) || 't-shirt',
    colors: (row.colors as string[]) || [],
    sizes: (row.sizes as string[]) || [],
  } as Product
}

export async function fetchActiveProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.size) {
    query = query.contains('sizes', [filters.size])
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(parseProduct)
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(parseProduct)
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return parseProduct(data)
}

export interface ProductInput {
  name: string
  description: string
  price: number
  image_url: string
  category: ProductCategoryId
  colors: string[]
  sizes: string[]
  active: boolean
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return parseProduct(data)
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return parseProduct(data)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
