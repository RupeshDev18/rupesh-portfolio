import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteSitemap from 'vite-plugin-sitemap';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
  //   ViteSitemap({
  //   hostname: 'https://rupesh-yadav.fun',
  // }),
   react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
