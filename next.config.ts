import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/course/[moduleId]/[lessonId]': ['./content/**/*'],
  },
}

export default nextConfig
