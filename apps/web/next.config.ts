import path from 'path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@jobpilot/ui', '@jobpilot/shared', '@jobpilot/db'],
  serverExternalPackages: ['pdf-parse', '@prisma/client'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default config
