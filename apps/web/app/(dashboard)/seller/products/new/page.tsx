"use client";

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
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
}

const INITIAL_FORM_DATA: ProductFormData = {
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

const CATEGORIES: Category[] = [
  { id: "1", name: "Fishing Nets" },
  { id: "2", name: "Fishing Lines" },
  { id: "3", name: "Fishing Hooks" },
  { id: "4", name: "Fishing Rods" },
  { id: "5", name: "Fishing Reels" },
  { id: "6", name: "Fishing Lures" },
  { id: "7", name: "Fishing Tackle" },
];

const AddProductPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] =
    useState<ProductFormData>(INITIAL_FORM_DATA);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Display a toast using this project's toast API.
   */
  const showToast = (
    title: string,
    description: string
  ) => {
    toast({
      title,
      description,
    });
  };

  /**
   * Handle text, number, checkbox and select fields.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.currentTarget;
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



  /**
   * Fetch categories.
   *
   * Currently using the project's placeholder categories.
   * Replace this with an API request once the category endpoint
   * is available.
   */
  useEffect(() => {
    setCategories(CATEGORIES);
  }, []);

  /**
   * Submit product.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      showToast(
        "Authentication required",
        "You must be logged in to add a product."
      );
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.price ||
      !formData.categoryId
    ) {
      const message =
        "Please fill in all required fields.";

      setError(message);
      showToast("Validation error", message);
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      const message = "Please enter a valid product price.";

      setError(message);
      showToast("Invalid price", message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        slug: formData.slug.trim(),
        title: formData.title.trim(),
        mainImage: formData.mainImage.trim() || null,
        price,
        description: formData.description.trim() || null,
        manufacturer: formData.manufacturer.trim() || null,
        categoryId: formData.categoryId,
        inStock: formData.inStock,

        netType: formData.netType.trim() || null,
        meshSize: formData.meshSize.trim() || null,
        netLength: formData.netLength.trim() || null,
        netHeight: formData.netHeight.trim() || null,
        material: formData.material.trim() || null,
        color: formData.color.trim() || null,
        threadDiameter:
          formData.threadDiameter.trim() || null,
        breakingStrength:
          formData.breakingStrength.trim() || null,
        usage: formData.usage.trim() || null,
        targetFishOrSpecies:
          formData.targetFishOrSpecies.trim() || null,
        waterType: formData.waterType.trim() || null,
        countryOfOrigin:
          formData.countryOfOrigin.trim() || null,
        weight: formData.weight.trim() || null,
        customizationAvailability:
          formData.customizationAvailability.trim() || null,
        shippingInformation:
          formData.shippingInformation.trim() || null,
      };

      const res = await apiClient.post(
        "/api/seller/products",
        payload
      );

      if (!res.ok) {
        let message = `Failed to create product: ${res.status}`;

        try {
          const data = await res.json();

          if (data?.error) {
            message = data.error;
          } else if (data?.message) {
            message = data.message;
          }
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(message);
      }

      showToast(
        "Product created",
        "Your fishnet product was created successfully."
      );

      router.push("/seller/products");
    } catch (err: unknown) {
      console.error("Error creating product:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to create product.";

      setError(message);

      showToast(
        "Product creation failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authentication loading.
   */
  if (status === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  /**
   * Not authenticated.
   */
  if (status === "unauthenticated") {
    router.replace("/login");

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  /**
   * Only sellers can create products.
   */
  if (session?.user?.role !== "SELLER") {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Add Product"
        path="Home | Dashboard | Seller | Products | Add"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Add New Product
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Fill in the details below to add a new
          fishing-net product to your store.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {/* Basic Information */}
          <section className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Product Title *
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Product Slug *
                </label>

                <input
                  id="slug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="premium-fishing-net"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="mainImage"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Main Image URL
                </label>

                <input
                  id="mainImage"
                  type="url"
                  name="mainImage"
                  value={formData.mainImage}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Price ($) *
                </label>

                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">
                    Select a category
                  </option>

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

              <div className="flex items-center gap-3">
                <input
                  id="inStock"
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />

                <label
                  htmlFor="inStock"
                  className="text-sm font-medium text-gray-700"
                >
                  In Stock
                </label>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Product Details
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  disabled={loading}
                  placeholder="Describe your product..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="manufacturer"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Manufacturer
                </label>

                <input
                  id="manufacturer"
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Fishnet Specifications */}
          <section className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Fishnet Specifications
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="netType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Net Type
                </label>

                <input
                  id="netType"
                  type="text"
                  name="netType"
                  value={formData.netType}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Gill Net, Seine Net, Trawl Net"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="meshSize"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mesh Size
                </label>

                <input
                  id="meshSize"
                  type="text"
                  name="meshSize"
                  value={formData.meshSize}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="2 inches, 50 mm"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="netLength"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Net Length
                </label>

                <input
                  id="netLength"
                  type="text"
                  name="netLength"
                  value={formData.netLength}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="100 feet, 50 meters"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="netHeight"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Net Height
                </label>

                <input
                  id="netHeight"
                  type="text"
                  name="netHeight"
                  value={formData.netHeight}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="10 feet, 3 meters"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="material"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Material
                </label>

                <input
                  id="material"
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Nylon, Polyethylene, Cotton"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Color
                </label>

                <input
                  id="color"
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="threadDiameter"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Thread Diameter
                </label>

                <input
                  id="threadDiameter"
                  type="text"
                  name="threadDiameter"
                  value={formData.threadDiameter}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="0.3mm, 0.5mm"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="breakingStrength"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Breaking Strength
                </label>

                <input
                  id="breakingStrength"
                  type="text"
                  name="breakingStrength"
                  value={formData.breakingStrength}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="100 lbs, 50 kg"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="usage"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Usage
                </label>

                <input
                  id="usage"
                  type="text"
                  name="usage"
                  value={formData.usage}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Commercial, Recreational, Aquaculture"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="targetFishOrSpecies"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Target Fish / Species
                </label>

                <input
                  id="targetFishOrSpecies"
                  type="text"
                  name="targetFishOrSpecies"
                  value={formData.targetFishOrSpecies}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Salmon, Tuna, Shrimp"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="waterType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Water Type
                </label>

                <input
                  id="waterType"
                  type="text"
                  name="waterType"
                  value={formData.waterType}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Saltwater, Freshwater, Brackish"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="countryOfOrigin"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Country of Origin
                </label>

                <input
                  id="countryOfOrigin"
                  type="text"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Weight
                </label>

                <input
                  id="weight"
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="lbs / kg"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="customizationAvailability"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Customization Availability
                </label>

                <input
                  id="customizationAvailability"
                  type="text"
                  name="customizationAvailability"
                  value={formData.customizationAvailability}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Yes, No, Custom orders accepted"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label
                  htmlFor="shippingInformation"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Shipping Information
                </label>

                <textarea
                  id="shippingInformation"
                  name="shippingInformation"
                  value={formData.shippingInformation}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  placeholder="Ships worldwide, Free shipping over $100"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/seller/products")}
              disabled={loading}
              className="rounded-md bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
