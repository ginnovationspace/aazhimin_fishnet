'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductItem, { type Product } from './ProductItem'
import Heading from './Heading'
import apiClient from '@/lib/api'

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get('/api/products')

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.statusText}`
          )
        }

        const result: unknown = await response.json()

        if (!cancelled) {
          const productData = Array.isArray(result)
            ? result
            : []

          setProducts(productData as Product[])
        }
      } catch (err: unknown) {
        console.error('Error fetching products:', err)

        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to load products'

          setError(message)
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchProducts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-screen-2xl px-6">
        <Heading title="Featured Fishnets" />

        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Hand-selected fishnets from trusted sellers
        </p>

        {loading && (
          <div
            className="mt-12 flex justify-center"
            role="status"
            aria-label="Loading products"
          >
            <div className="flex space-x-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div
            className="mt-12 rounded-lg border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <p className="text-center text-red-700">{error}</p>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-12">
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group transition-shadow duration-300 hover:shadow-lg"
                  >
                    <ProductItem product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg">
                  No fishnets available at the moment.
                </p>

                <p className="mt-4">
                  Check back soon as we&apos;re constantly adding new fishnets to
                  help you succeed on the water.
                </p>

                <Link
                  href="/shop"
                  className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Browse Fishnets
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductsSection
