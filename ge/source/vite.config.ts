import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export const base = "/GithubPages/ge/";

export default defineConfig({
  base,
  plugins: [tailwindcss(), glsl({ minify: true })],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    target: "es2022",
    outDir: "dist",
    assetsInlineLimit: 2048,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 900,
  },
  server: { port: 5173, strictPort: true },
});
