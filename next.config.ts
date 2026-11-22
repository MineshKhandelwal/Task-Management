import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  sassOptions: {
    additionalData: `@use "@/styles/tokens" as *;`,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/settings",
        destination: "/settings/users",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
