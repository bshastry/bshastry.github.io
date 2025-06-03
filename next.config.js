/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
}

module.exports = nextConfig