/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

const base = "/bricks-properties/";

// GitHub Pages serves 404.html for unknown paths: make old deep links (e.g. /login) load the app.
function spaFallback(): Plugin {
  return {
    name: "spa-404-fallback",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (index?.type === "asset") {
        this.emitFile({ type: "asset", fileName: "404.html", source: index.source });
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Bricks properties",
        short_name: "Bricks map",
        description: "A map of your Bricks.co properties, built on OpenStreetMap",
        theme_color: "#1f3a5f",
        background_color: "#ffffff",
        display: "standalone",
        start_url: base,
        icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
    }),
    spaFallback(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
  },
});
