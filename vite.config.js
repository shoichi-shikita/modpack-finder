import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { youtubeDevPlugin } from './server/youtube/dev-plugin.js'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), youtubeDevPlugin({ ...process.env, ...loadEnv(mode, process.cwd(), '') })],
}))
