import { ProductItem, SectionTitle } from "@/components";
import apiClient from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { sanitize } from "@/lib/sanitize";

interface Props {
  searchParams: { search: string };
}

// Sending API request for search results for a given search text
const SearchPage = async ({ searchParams }: Props) => {
  const sp = await searchParams;
  let products = [];

  try {
    const data = await apiClient.get(
      `/api/search?query=${sp?.search || ""}`
    );

    if (!data.ok) {
      console.error('Failed to fetch search results:', data.statusText);
      products = [];
    } else {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    products = [];
  }

  return (
    <div>
      <SectionTitle title="Search for Fishnets" path="Home | Search" />
      <div className="max-w-screen-2xl mx-auto">
        {sp?.search && (
          <h3 className="text-4xl text-center py-10 max-sm:text-3xl">
            Showing results for &quot;{sanitize(sp?.search)}&quot;
          </h3>
        )}
        <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductItem key={product.id} product={product} color="black" />
            ))
          ) : (
            <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
              No fishnets found for &quot;{sanitize(sp?.search || "")}&quot;
            </h3>
          )}
        </div>

        {/* Search tips when no results */}
        {!products.length && sp?.search?.trim() && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Try searching for:
            <ul className="flex flex-wrap justify-center gap-2 mt-2">
              <li>Gill Net</li>
              <li>Seine Net</li>
              <li>Trawl Net</li>
              <li>Cast Net</li>
              <li>Nylon Net</li>
              <li>HDPE Net</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
