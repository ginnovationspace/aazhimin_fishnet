import Link from "next/link";

const IntroducingSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
            About fishnet
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A simpler way to buy and sell fishnets
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            fishnet connects manufacturers, sellers, distributors, and buyers
            in one specialized marketplace. Discover the right nets, compare
            products, and connect with trusted sellers.
          </p>
        </div>

        {/* Values */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              ✓
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Trusted Marketplace
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Connect with fishnet sellers and discover products with clear
              specifications.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              ↔
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Easy to Compare
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Search, compare, and choose fishnets based on your requirements
              without unnecessary complexity.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              ♻
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Built for the Industry
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Supporting quality products, responsible sellers, and a more
              sustainable fishing industry.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Learn more about fishnet
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IntroducingSection;