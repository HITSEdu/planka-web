import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [new URL(process.env.NEXT_PUBLIC_REMOTE_PATTERN!)],
  },
}

export default nextConfig
