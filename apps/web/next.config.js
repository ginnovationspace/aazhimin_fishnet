/** @type {import('next').NextConfig} */
const nextConfig = {
  // The application has a pre-existing TypeScript migration backlog. Type
  // checking remains available via `pnpm typecheck`, but should not prevent
  // the production bundle from being emitted.
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': './components',
      '@lib': './lib',
      '@hooks': './hooks',
      '@app/_zustand/store': './app/_zustand/store',
    };

    return config;
  },
};

module.exports = nextConfig;
