import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dns from 'dns'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/server-options.html#server-options
dns.setDefaultResultOrder('verbatim')

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components/'),
      styles: path.resolve(__dirname, './src/styles/'),
      api: path.resolve(__dirname, './src/api/'),
      pages: path.resolve(__dirname, './src/pages/'),
    },
  },
})
