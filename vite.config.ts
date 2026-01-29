import path from "path"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: process.env.GITHUB_PAGES ? '/pixeo/' : '/',
  ssr: {
    noExternal: ['vue-sonner']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['fabric'],
    esbuildOptions: {
      // Necesario para que fabric se optimice correctamente
      mainFields: ['module', 'main'],
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      // Asegurar que fabric se incluya correctamente
      include: [/node_modules/],
    },
  },
})
