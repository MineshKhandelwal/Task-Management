import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  sassOptions: {
    additionalData: `@use "@/styles/tokens" as *;`,
  },
};

export default nextConfig;
