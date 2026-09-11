import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs work at both a user site and any GitHub Pages project path.
  base: './',
})
