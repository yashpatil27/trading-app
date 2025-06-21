/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Frontend-only configuration for Vercel
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bittrade-api.loca.lt'}/api/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig
