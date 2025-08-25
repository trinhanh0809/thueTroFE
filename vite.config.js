import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite mặc định coi project root = thư mục gốc, nên chỉ cần "/src"
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
