export type ProductCategoryId =
  | 't-shirt'
  | 'polo-shirt'
  | 'shirt'
  | 'sweatshirt'
  | 'hoodie'
  | 'jacket'
  | 'jeans'
  | 'pants'
  | 'sweatpants'
  | 'shorts'
  | 'shoes'
  | 'sandals'
  | 'sportswear'
  | 'accessories'
  | 'new-arrivals'

export type SizeType = 'clothing' | 'waist' | 'shoe' | 'one-size'

export interface ProductCategory {
  id: ProductCategoryId
  label: string
  description: string
  sizeType: SizeType
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 't-shirt', label: 'T-Shirt', description: 'Short sleeve casual shirts', sizeType: 'clothing' },
  { id: 'polo-shirt', label: 'Polo Shirt', description: 'Polo-style shirts', sizeType: 'clothing' },
  { id: 'shirt', label: 'Shirt', description: 'Formal/casual button-up shirts', sizeType: 'clothing' },
  { id: 'sweatshirt', label: 'Sweatshirt', description: 'Crew neck sweaters', sizeType: 'clothing' },
  { id: 'hoodie', label: 'Hoodie', description: 'Hooded sweatshirts', sizeType: 'clothing' },
  { id: 'jacket', label: 'Jacket', description: 'Light and heavy jackets', sizeType: 'clothing' },
  { id: 'jeans', label: 'Jeans', description: 'Denim pants', sizeType: 'waist' },
  { id: 'pants', label: 'Pants', description: 'Casual/formal pants', sizeType: 'waist' },
  { id: 'sweatpants', label: 'Sweatpants', description: 'Joggers and training pants', sizeType: 'waist' },
  { id: 'shorts', label: 'Shorts', description: 'All short pants', sizeType: 'waist' },
  { id: 'shoes', label: 'Shoes', description: 'Sneakers, casual shoes, boots', sizeType: 'shoe' },
  { id: 'sandals', label: 'Sandals', description: 'Slippers and sandals', sizeType: 'shoe' },
  { id: 'sportswear', label: 'Sportswear', description: 'Gym and training clothing', sizeType: 'clothing' },
  { id: 'accessories', label: 'Accessories', description: 'Belts, caps, wallets, etc.', sizeType: 'one-size' },
  { id: 'new-arrivals', label: 'New Arrivals', description: 'Latest additions', sizeType: 'clothing' },
]

export const SIZE_PRESETS: Record<SizeType, string[]> = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  waist: ['28', '30', '32', '34', '36', '38', '40'],
  shoe: ['38', '39', '40', '41', '42', '43', '44', '45'],
  'one-size': ['One Size'],
}

export const SIZE_TYPE_LABELS: Record<SizeType, string> = {
  clothing: 'Clothing sizes',
  waist: 'Waist sizes',
  shoe: 'Shoe sizes (EU)',
  'one-size': 'Size',
}

export const PRODUCT_CATEGORY_IDS = PRODUCT_CATEGORIES.map((c) => c.id)

export function getCategoryById(id: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.id === id)
}

export function getCategoryLabel(id: string): string {
  return getCategoryById(id)?.label ?? id
}

export function getSizeTypeForCategory(categoryId: string): SizeType {
  return getCategoryById(categoryId)?.sizeType ?? 'clothing'
}

export function getSizeOptionsForCategory(categoryId: string): string[] {
  return SIZE_PRESETS[getSizeTypeForCategory(categoryId)]
}

export function getFilterSizesForCategory(categoryId: string | null): string[] {
  if (!categoryId) {
    return [
      ...SIZE_PRESETS.clothing,
      ...SIZE_PRESETS.waist,
      ...SIZE_PRESETS.shoe,
    ]
  }
  return getSizeOptionsForCategory(categoryId)
}
