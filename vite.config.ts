import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // In development, proxy API requests to the serverless dev server if it's running
    proxy: {
      '/api': {
  target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3001', // default matches dev:full; override if needed
        changeOrigin: true,
        // Avoid Vite rewriting the path; we want /api/... as-is
        rewrite: (path) => path,
        // Only enable proxy in dev mode to avoid interfering with prod
        bypass: (_req, _res, options) => {
          if (mode !== 'development') return false;
          return undefined;
        }
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
  },
  publicDir: 'public',
}));
