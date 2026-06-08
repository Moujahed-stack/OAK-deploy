import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { SizePicker } from '../../components/SizePicker'
import {
  getCategoryLabel,
  getSizeOptionsForCategory,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_IDS,
} from '../../lib/categories'
import { ensureAdminSession } from '../../lib/admin'
import { formatCurrency } from '../../lib/format'
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from '../../services/products'
import type { Product } from '../../types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.enum(PRODUCT_CATEGORY_IDS as [string, ...string[]]),
  colors: z.string(),
  active: z.boolean(),
})

type ProductForm = z.infer<typeof productSchema>

function toFormValues(product?: Product): ProductForm {
  return {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 't-shirt',
    colors: product?.colors.join(', ') || '',
    active: product?.active ?? true,
  }
}

function toProductInput(data: ProductForm, imageUrl: string, sizes: string[]): ProductInput {
  return {
    name: data.name,
    description: data.description,
    price: data.price,
    image_url: imageUrl,
    category: data.category as ProductInput['category'],
    colors: data.colors.split(',').map((s) => s.trim()).filter(Boolean),
    sizes,
    active: data.active,
  }
}

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [error, setError] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchAllProducts,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(),
  })

  const watchedCategory = watch('category')

  useEffect(() => {
    if (!showForm) return
    const validSizes = getSizeOptionsForCategory(watchedCategory)
    setSelectedSizes((prev) => {
      if (editing && editing.category === watchedCategory) {
        return editing.sizes.filter((s) => validSizes.includes(s))
      }
      return prev.filter((s) => validSizes.includes(s))
    })
  }, [watchedCategory, showForm, editing])

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      await ensureAdminSession()

      if (selectedSizes.length === 0) {
        throw new Error('Select at least one size for this product type')
      }

      let imageUrl = editing?.image_url || ''
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          throw new Error(
            `Image upload failed: ${msg}. Ensure the product-images bucket exists and run supabase/fix-rls.sql — or save without an image.`
          )
        }
      }

      const input = toProductInput(data, imageUrl, selectedSizes)
      if (editing) {
        return updateProduct(editing.id, input)
      }
      return createProduct(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowForm(false)
      setEditing(null)
      setImageFile(null)
      setSelectedSizes([])
      reset(toFormValues())
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save product'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateProduct(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const openCreate = () => {
    setEditing(null)
    reset(toFormValues())
    setSelectedSizes([])
    setShowForm(true)
    setError('')
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    reset(toFormValues(product))
    setSelectedSizes(product.sizes)
    setShowForm(true)
    setError('')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openCreate}>Add Product</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>
          <form
            onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <Select
              label="Type / Category"
              options={PRODUCT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
              error={errors.category?.message}
              {...register('category')}
            />
            <div className="sm:col-span-2">
              <Textarea label="Description" rows={3} {...register('description')} />
            </div>
            <Input label="Colors (comma-separated)" placeholder="Black, White, Blue" {...register('colors')} />
            <SizePicker
              category={watchedCategory}
              selected={selectedSizes}
              onChange={setSelectedSizes}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('active')} />
              Active
            </label>
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={saveMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Product</th>
              <th className="px-4 py-3 font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 font-medium text-gray-700">Price</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-50">👕</div>
                    )}
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{getCategoryLabel(product.category)}</td>
                <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.active ? 'success' : 'default'}>
                    {product.active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({ id: product.id, active: !product.active })
                      }
                    >
                      {product.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('Delete this product?')) deleteMutation.mutate(product.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
