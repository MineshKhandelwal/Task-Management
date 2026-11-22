import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  sassOptions: {
    additionalData: `@use "@/styles/tokens" as *;`,
  },
  async redirects() {
    return [
      {
        source: "/settings",
        destination: "/settings/users",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
