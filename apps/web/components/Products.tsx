// *********************
// Role of the component: Enhanced products grid with improved loading and empty states
// Name of the component: Products.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <Products params={params} searchParams={searchParams} />
// Input parameters: { params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }
// Output: Products grid with skeleton loaders, better empty state, and error handling
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import apiClient from "@/lib/api";

const Products = async ({ params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }) => {
  // getting all data from URL slug and preparing everything for sending GET request
  const inStockNum = searchParams?.inStock === "true" ? 1 : 0;
  const outOfStockNum = searchParams?.outOfStock === "true" ? 1 : 0;
  const page = searchParams?.page ? Number(searchParams?.page) : 1;

  let stockMode: string = "lte";

  // preparing inStock and out of stock filter for GET request
  // If in stock checkbox is checked, stockMode is "equals"
  if (inStockNum === 1) {
    stockMode = "equals";
  }
   // If out of stock checkbox is checked, stockMode is "lt"
  if (outOfStockNum === 1) {
    stockMode = "lt";
  }
   // If in stock and out of stock checkboxes are checked, stockMode is "lte"
  if (inStockNum === 1 && outOfStockNum === 1) {
    stockMode = "lte";
  }
   // If in stock and out of stock checkboxes aren't checked, stockMode is "gt"
  if (inStockNum === 0 && outOfStockNum === 0) {
    stockMode = "gt";
  }

  // State for loading and error handling
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // sending API request with filtering, sorting and pagination for getting all products
        const data = await apiClient.get(`/api/products?filters[price][$lte]=${
            searchParams?.price || 3000
          }&filters[rating][$gte]=${
            Number(searchParams?.rating) || 0
          }&filters[inStock][$${stockMode}]=1&${
            params?.slug?.length! > 0
              ? `filters[category][$equals]=${params?.slug}&`
              : ""
          }sort=${searchParams?.sort}&page=${page}`);

        if (!isMounted) return;

        if (!data.ok) {
          throw new Error(`HTTP error! status: ${data.status}`);
        } else {
          const result = await data.json();
          setProducts(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [params, searchParams, page, stockMode]);

  // Skeleton loader for product item
  const ProductSkeleton = () => (
    <div className="flex flex-col items-center gap-y-2 bg-gray-50 p-4 rounded-lg">
      <div className="h-48 w-full bg-gray-200 rounded rounded-t-lg"></div>
      <h3 className="h-6 w-32 bg-gray-200 rounded"></h3>
      <p className="h-4 w-24 bg-gray-200 rounded"></p>
      <div className="h-2 w-16 bg-gray-200 rounded"></div>
      <button className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded hover:bg-gray-400">
        Loading...
      </button>
    </div>
  );

  if (loading) {
    // Show skeleton loaders while fetching
    return (
      <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">
          We couldn't load the products at the moment. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
      {products.length > 0 ? (
        products.map((product: any) => (
          <ProductItem key={product.id} product={product} color="black" />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-5h.01M9 16h.01"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            No Products Found
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-xl">
            We couldn't find any products matching your current filters.
            Try adjusting your search criteria or clearing some filters.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Clear filters and reset to default view
                const url = new URL(window.location);
                url.searchParams.delete('inStock');
                url.searchParams.delete('outOfStock');
                url.searchParams.delete('rating');
                url.searchParams.delete('price');
                url.searchParams.delete('sort');
                window.location.href = url.toString();
              }}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
            <Link
              href="/"
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;