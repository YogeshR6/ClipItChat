import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "www.giantbomb.com",
      },
    ],
  },
};

export default nextConfig;
