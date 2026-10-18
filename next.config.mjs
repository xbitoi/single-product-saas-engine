/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: [
    "playwright",
    "cheerio",
    "@prisma/client",
    "@electric-sql/pglite",
    "pglite-prisma-adapter",
  ],
};

export default nextConfig;
