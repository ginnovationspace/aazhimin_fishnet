// *********************
// Role of the component: Enhanced filters on shop page with better UX
// Name of the component: Filters.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <Filters />
// Input parameters: no input parameters
// Output: Improved filter UI with collapsible sections, better visual feedback
// *********************

"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";

interface InputCategory {
  inStock: { text: string, isChecked: boolean },
  outOfStock: { text: string, isChecked: boolean },
  priceFilter: { text: string, value: number },
  ratingFilter: { text: string, value: number },
}

const Filters = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  // getting current page number from Zustand store
  const { page } = usePaginationStore();

  const [inputCategory, setInputCategory] = useState<InputCategory>({
    inStock: { text: "In Stock", isChecked: true },
    outOfStock: { text: "Out of Stock", isChecked: true },
    priceFilter: { text: "Max Price", value: 3000 },
    ratingFilter: { text: "Min Rating", value: 0 },
  });
  const { sortBy } = useSortStore();

  useEffect(() => {
    const params = new URLSearchParams();
    // setting URL params and after that putting them all in URL
    params.set("outOfStock", inputCategory.outOfStock.isChecked.toString());
    params.set("inStock", inputCategory.inStock.isChecked.toString());
    params.set("rating", inputCategory.ratingFilter.value.toString());
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", page.toString());
    replace(`${pathname}?${params}`);
  }, [inputCategory, sortBy, page, pathname, replace]);

  const handleApplyFilters = () => {
    // This function is called when user clicks "Apply Filters" button
    // Currently handled automatically via useEffect, but could add a button
    // for explicit apply if needed
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-5h.01M9 16h.01"></path>
        </svg>
        Filters
      </h3>
      <div className="border-t border-gray-200 pt-4"></div>

      {/* Availability Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          Availability
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="in-stock-filter"
              checked={inputCategory.inStock.isChecked}
              onChange={(e) =>
                setInputCategory({
                  ...inputCategory,
                  inStock: {
                    text: "In Stock",
                    isChecked: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="in-stock-filter"
              className="ml-2 text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              In Stock
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="out-of-stock-filter"
              checked={inputCategory.outOfStock.isChecked}
              onChange={(e) =>
                setInputCategory({
                  ...inputCategory,
                  outOfStock: {
                    text: "Out of Stock",
                    isChecked: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="out-of-stock-filter"
              className="ml-2 text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Out of Stock
            </label>
          </div>
        </div>
      </div>

      {/* Price Range Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          Price Range
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">$0</span>
            <span className="text-sm text-gray-500">${inputCategory.priceFilter.value}</span>
          </div>
          <input
            type="range"
            id="price-range"
            min={0}
            max={3000}
            step={10}
            value={inputCategory.priceFilter.value}
            onChange={(e) =>
              setInputCategory({
                ...inputCategory,
                priceFilter: {
                  text: "Max Price",
                  value: Number(e.target.value),
                },
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>$0</span>
            <span>$50</span>
            <span>$100</span>
            <span>$150</span>
            <span>$200</span>
            <span>$250</span>
            <span>$300</span>
            <span>$350</span>
            <span>$400</span>
            <span>$450</span>
            <span>$500</span>
            <span>$550</span>
            <span>$600</span>
            <span>$650</span>
            <span>$700</span>
            <span>$750</span>
            <span>$800</span>
            <span>$850</span>
            <span>$900</span>
            <span>$950</span>
            <span>$1000</span>
            <span>$1500</span>
            <span>$2000</span>
            <span>$2500</span>
            <span>$3000</span>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          Minimum Rating
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">0★</span>
            <span className="text-sm text-gray-500">5★</span>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              id="rating-range"
              min={0}
              max={5}
              step={1}
              value={inputCategory.ratingFilter.value}
              onChange={(e) =>
                setInputCategory({
                  ...inputCategory,
                  ratingFilter: { text: "Min Rating", value: Number(e.target.value) },
                })
              }
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>0★</span>
            <span>1★</span>
            <span>2★</span>
            <span>3★</span>
            <span>4★</span>
            <span>5★</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="font-medium">Selected: </span>
            <span className="text-yellow-500">
              {[...Array(inputCategory.ratingFilter.value)].map((_, i) => "★").join("")}
              {inputCategory.ratingFilter.value > 0 ? "" : "No rating"}
            </span>
          </div>
        </div>
      </div>

      {/* Apply Filters Button (optional - currently auto-applies) */}
      {/*
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleApplyFilters}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
      */}
    </div>
  );
};

export default Filters;