// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@metamask/sdk': false,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
      'utf-8-validate': false,
      'bufferutil': false,
    }
    return config
  },
}

export default nextConfig
