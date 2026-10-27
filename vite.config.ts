import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // One fixed local URL — avoids stale multi-port Vite sessions during iteration.
  // host:true binds IPv4 + IPv6 so 127.0.0.1:5200 works (not only ::1).
  server: {
    host: true,
    port: 5200,
    strictPort: true,
  },
})
