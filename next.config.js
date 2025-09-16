/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
