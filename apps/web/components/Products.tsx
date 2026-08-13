'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductItem, { type Product } from './ProductItem'
import apiClient from '@/lib/api'

interface ProductsProps {
  params: {
    slug?: string[]
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const getSearchParam = (
  value: string | string[] | undefined
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

const Products = ({
  params,
  searchParams,
}: ProductsProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inStockNum =
    getSearchParam(searchParams?.inStock) === 'true'
      ? 1
      : 0

  const outOfStockNum =
    getSearchParam(searchParams?.outOfStock) === 'true'
      ? 1
      : 0

  const page =
    Number(getSearchParam(searchParams?.page)) || 1

  let stockMode = 'lte'

  if (inStockNum === 1 && outOfStockNum === 0) {
    stockMode = 'equals'
  } else if (
    inStockNum === 0 &&
    outOfStockNum === 1
  ) {
    stockMode = 'lt'
  } else if (
    inStockNum === 0 &&
    outOfStockNum === 0
  ) {
    stockMode = 'gt'
  }

  const price =
    getSearchParam(searchParams?.price) || '3000'

  const rating =
    Number(getSearchParam(searchParams?.rating)) || 0

  const sort = getSearchParam(searchParams?.sort)

  // Fishnet filters
  const netType = getSearchParam(searchParams?.netType)
  const material = getSearchParam(searchParams?.material)
  const meshSize = getSearchParam(searchParams?.meshSize)
  const color = getSearchParam(searchParams?.color)
  const usage = getSearchParam(searchParams?.usage)

  const category = params?.slug?.length
    ? params.slug.join(',')
    : ''

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()

        queryParams.set(
          'filters[price][$lte]',
          price
        )

        queryParams.set(
          'filters[rating][$gte]',
          String(rating)
        )

        queryParams.set(
          `filters[inStock][$${stockMode}]`,
          '1'
        )

        if (netType) {
          queryParams.set(
            'filters[netType][$equals]',
            netType
          )
        }

        if (material) {
          queryParams.set(
            'filters[material][$equals]',
            material
          )
        }

        if (meshSize) {
          queryParams.set(
            'filters[meshSize][$equals]',
            meshSize
          )
        }

        if (color) {
          queryParams.set(
            'filters[color][$equals]',
            color
          )
        }

        if (usage) {
          queryParams.set(
            'filters[usage][$equals]',
            usage
          )
        }

        if (category) {
          queryParams.set(
            'filters[category][$equals]',
            category
          )
        }

        if (sort) {
          queryParams.set('sort', sort)
        }

        queryParams.set('page', String(page))

        const response = await apiClient.get(
          `/api/products?${queryParams.toString()}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Unable to load products. Server returned ${response.status}.`
          )
        }

        const result: unknown = await response.json()

        if (!isMounted) {
          return
        }

        const productData =
          Array.isArray(result)
            ? result
            : (
                result &&
                typeof result === 'object' &&
                'products' in result &&
                Array.isArray(
                  (result as { products: unknown }).products
                )
              )
              ? (
                  result as {
                    products: unknown[]
                  }
                ).products
              : []

        setProducts(productData as Product[])
      } catch (err: unknown) {
        if (!isMounted) {
          return
        }

        console.error(
          'Error fetching products:',
          err
        )

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load products'

        setError(message)
        setProducts([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchProducts()

    return () => {
      isMounted = false
    }
  }, [
    price,
    rating,
    sort,
    category,
    page,
    stockMode,
    netType,
    material,
    meshSize,
    color,
    usage,
  ])

  const clearFilters = () => {
    const url = new URL(window.location.href)

    url.searchParams.delete('inStock')
    url.searchParams.delete('outOfStock')
    url.searchParams.delete('rating')
    url.searchParams.delete('price')
    url.searchParams.delete('sort')
    url.searchParams.delete('page')
    url.searchParams.delete('netType')
    url.searchParams.delete('material')
    url.searchParams.delete('meshSize')
    url.searchParams.delete('color')
    url.searchParams.delete('usage')

    window.location.href = url.toString()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <ProductSkeleton key={index} />
          )
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl text-red-600">
            !
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>

        <p className="mt-2 max-w-md text-sm text-gray-600">
          We couldn&apos;t load the products at the
          moment. Please try again.
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-6 rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-6xl">
          🎣
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          No Fishnets Found
        </h2>

        <p className="mt-2 max-w-md text-sm text-gray-600">
          We couldn&apos;t find any fishnets matching
          your current filters. Try adjusting your
          search criteria or clearing some filters.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md bg-gray-200 px-5 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Clear Filters
          </button>

          <Link
            href="/shop"
            className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse All Fishnets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}

const ProductSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-200" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-6 w-1/3 rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
      </div>
    </div>
  )
}

export default Products
