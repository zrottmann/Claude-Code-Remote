/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For Appwrite deployment
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,
}

module.exports = nextConfig