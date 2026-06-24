import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@jobpilot/ui', '@jobpilot/shared', '@jobpilot/db'],
  serverExternalPackages: ['pdf-parse'],
}

export default config
