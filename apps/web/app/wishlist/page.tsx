import { SectionTitle } from "@/components";
import { Loader } from "@/components/Loader";
import { WishlistModule } from "@/components/modules/wishlist";
import { Suspense } from "react";

const WishlistPage = () => {
  return (
    <div className="bg-white">
      <SectionTitle title="Your Wishlist" path="Home | Wishlist" />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Your Wishlist
        </h1>
        <p className="mt-3 text-gray-600">
          Save fishing nets and equipment to compare or purchase later.
        </p>
        <div className="mt-8">
          <Suspense fallback={<Loader />}>
            <WishlistModule />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;
