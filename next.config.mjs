/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent flaky local cache corruption that can break chunk/css loading.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
