import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import tailwindcss from '@tailwindcss/vite'

dotenv.config();
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      host: true,
      port: 5173,
      allowedHosts: ['*'],
      // proxy /api to backend container (Docker Compose service name: backend)
      proxy: {
        "/api": {
          target: "http://localhost:2222",
          changeOrigin: true,
          secure: false,
        }
      }
  }
})
