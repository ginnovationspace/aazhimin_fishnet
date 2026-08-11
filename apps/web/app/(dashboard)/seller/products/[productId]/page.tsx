"use client";

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Category = {
  id: string;
  name: string;
};

type ProductFormData = {
  slug: string;
  title: string;
  mainImage: string;
  price: string;
  description: string;
  manufacturer: string;
  categoryId: string;
  inStock: boolean;
  netType: string;
  meshSize: string;
  netLength: string;
  netHeight: string;
  material: string;
  color: string;
  threadDiameter: string;
  breakingStrength: string;
  usage: string;
  targetFishOrSpecies: string;
  waterType: string;
  countryOfOrigin: string;
  weight: string;
  customizationAvailability: string;
  shippingInformation: string;
};

const initialFormData: ProductFormData = {
  slug: "",
  title: "",
  mainImage: "",
  price: "",
  description: "",
  manufacturer: "",
  categoryId: "",
  inStock: true,
  netType: "",
  meshSize: "",
  netLength: "",
  netHeight: "",
  material: "",
  color: "",
  threadDiameter: "",
  breakingStrength: "",
  usage: "",
  targetFishOrSpecies: "",
  waterType: "",
  countryOfOrigin: "",
  weight: "",
  customizationAvailability: "",
  shippingInformation: "",
};

const categories: Category[] = [
  { id: "1", name: "Fishing Nets" },
  { id: "2", name: "Fishing Lines" },
  { id: "3", name: "Fishing Hooks" },
  { id: "4", name: "Fishing Rods" },
  { id: "5", name: "Fishing Reels" },
  { id: "6", name: "Fishing Lures" },
  { id: "7", name: "Fishing Tackle" },
];

const EditProductPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const { toast } = useToast();

  const productId = params.productId;

  const [formData, setFormData] =
    useState<ProductFormData>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);

    toast({
      title: "Error",
      description: message,
    });
  };

  const fetchProduct = async () => {
    if (!session?.user || !productId) {
      setError("User or product not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(
        `/api/seller/products/${productId}`
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch product: ${res.status}`
        );
      }

      const product = await res.json();

      setFormData({
        slug: product.slug ?? "",
        title: product.title ?? "",
        mainImage: product.mainImage ?? "",
        price:
          product.price !== null && product.price !== undefined
            ? String(product.price)
            : "",
        description: product.description ?? "",
        manufacturer: product.manufacturer ?? "",
        categoryId: product.categoryId ?? "",
        inStock: product.inStock ?? true,

        netType: product.netType ?? "",
        meshSize: product.meshSize ?? "",
        netLength: product.netLength ?? "",
        netHeight: product.netHeight ?? "",
        material: product.material ?? "",
        color: product.color ?? "",
        threadDiameter: product.threadDiameter ?? "",
        breakingStrength: product.breakingStrength ?? "",
        usage: product.usage ?? "",
        targetFishOrSpecies:
          product.targetFishOrSpecies ?? "",
        waterType: product.waterType ?? "",
        countryOfOrigin: product.countryOfOrigin ?? "",
        weight:
          product.weight !== null && product.weight !== undefined
            ? String(product.weight)
            : "",
        customizationAvailability:
          product.customizationAvailability ?? "",
        shippingInformation:
          product.shippingInformation ?? "",
      });
    } catch (err: unknown) {
      console.error("Error fetching product:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load product";

      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      showError("You must be logged in to edit a product");
      return;
    }

    if (
      !formData.title ||
      !formData.slug ||
      !formData.price ||
      !formData.categoryId
    ) {
      showError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await apiClient.put(
        `/api/seller/products/${productId}`,
        formData
      );

      if (!res.ok) {
        throw new Error(
          `Failed to update product: ${res.status}`
        );
      }

      toast({
        title: "Product updated",
        description: "Product updated successfully.",
      });

      router.push("/(dashboard)/seller/products");
    } catch (err: unknown) {
      console.error("Error updating product:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to update product";

      showError(message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && productId) {
      void fetchProduct();
    }
  }, [status, productId]);

  if (status === "loading" || loading) {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return <p>Redirecting to login...</p>;
  }

  if (session?.user?.role !== "SELLER") {
    if (session?.user?.role === "ADMIN") {
      router.push("/(dashboard)/admin");
    } else {
      router.push("/");
    }

    return <p>Redirecting...</p>;
  }

  if (!productId) {
    return <p>Invalid product ID</p>;
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Edit Product"
        path="Home | Dashboard | Seller | Products | Edit"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Edit Product
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Update the details below for your fishing-net product.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Slug *
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., premium-fishing-net"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Main Image URL
              </label>

              <input
                type="url"
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price ($) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category *
              </label>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                In Stock
              </label>

              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your product..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Manufacturer
            </label>

            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Fishnet Specifications
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["netType", "Net Type", "e.g., Gill Net, Seine Net, Trawl Net"],
                ["meshSize", "Mesh Size", "e.g., 2 inches, 50 mm"],
                ["netLength", "Net Length", "e.g., 100 feet, 50 meters"],
                ["netHeight", "Net Height", "e.g., 10 feet, 3 meters"],
                ["material", "Material", "e.g., Nylon, Polyethylene, Cotton"],
                ["color", "Color", ""],
                ["threadDiameter", "Thread Diameter", "e.g., 0.3mm, 0.5mm"],
                ["breakingStrength", "Breaking Strength", "e.g., 100 lbs, 50 kg"],
                ["usage", "Usage", "e.g., Commercial, Recreational, Aquaculture"],
                ["targetFishOrSpecies", "Target Fish/Species", "e.g., Salmon, Tuna, Shrimp"],
                ["waterType", "Water Type", "e.g., Saltwater, Freshwater, Brackish"],
                ["countryOfOrigin", "Country of Origin", ""],
                ["weight", "Weight (lbs/kg)", ""],
                ["customizationAvailability", "Customization Availability", "e.g., Yes, No, Custom orders accepted"],
                ["shippingInformation", "Shipping Information", "e.g., Ships worldwide, Free shipping over $100"],
              ].map(([name, label, placeholder]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                  </label>

                  <input
                    type="text"
                    name={name}
                    value={
                      formData[name as keyof ProductFormData] as string
                    }
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() =>
                router.push("/(dashboard)/seller/products")
              }
              className="rounded-md bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
