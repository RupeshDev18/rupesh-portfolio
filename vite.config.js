import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteSitemap from 'vite-plugin-sitemap';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ViteSitemap({
    hostname: 'https://rupesh-portfolio-tk3v.onrender.com',
    exclude: ["/googleaaa5db7019bf9846"],
  }), react()],
});
