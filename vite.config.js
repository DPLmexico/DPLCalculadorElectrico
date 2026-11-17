import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Rutas relativas: funciona en github.io/DPLCalculadorElectrico/ y en calc.dplmexico.com
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
  ],
})