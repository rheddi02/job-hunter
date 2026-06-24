import type { Config } from 'tailwindcss'
import uiConfig from '@jobpilot/ui/tailwind.config'

const config: Config = {
  presets: [uiConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
}

export default config
