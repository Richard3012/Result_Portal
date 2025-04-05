import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';



export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
    sourcemap: true,
  },
  server: {
    port: parseInt(process.env.PORT) || 3000 || 6000,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },
  preview: {
    port: 4000,
    strictPort: true,
    host: true,
  },
  base: "./",
  css: {
    devSourcemap: true,
  },
});