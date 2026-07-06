import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteSitemap from 'vite-plugin-sitemap';
import fs from 'fs';

// Dynamically generate routes from our data files for search crawler sitemap indexing
const getDynamicRoutes = () => {
  try {
    const portfolioData = JSON.parse(fs.readFileSync('./src/data/data.json', 'utf-8'));
    const projectRoutes = portfolioData.projects.map(p => `/project/${p.id}`);

    const blogDataFile = fs.readFileSync('./src/data/blogData.js', 'utf-8');
    const blogRoutes = [...blogDataFile.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => `/blog/${m[1]}`);

    const cheatsheetDataFile = fs.readFileSync('./src/data/cheatsheetsData.js', 'utf-8');
    const cheatsheetBlocks = cheatsheetDataFile.split(/\{\s*id:/);
    const cheatsheetRoutes = [];
    cheatsheetBlocks.slice(1).forEach(block => {
      const idMatch = block.match(/^\s*["']([^"']+)["']/);
      const isComingSoon = block.includes("isComingSoon: true");
      if (idMatch && !isComingSoon) {
        cheatsheetRoutes.push(`/handbook/${idMatch[1]}`);
      }
    });

    return ['/handbook', ...projectRoutes, ...blogRoutes, ...cheatsheetRoutes];
  } catch (error) {
    console.error("Failed to gather dynamic sitemap routes:", error);
    return [];
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteSitemap({
      hostname: 'https://rupesh-yadav.fun',
      dynamicRoutes: getDynamicRoutes(),
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
