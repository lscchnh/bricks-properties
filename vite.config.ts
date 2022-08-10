import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/bricks-properties/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      mode: "development",
      base: "/bricks-properties/",
      includeAssets: ["/favicon.ico", "/bricks-properties/favicon.ico"],
      manifest: {
        name: "Bricks properties",
        short_name: "TF",
        description: "An application to show your bricks.co investments thanks to OpenStreetMap",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/bricks-properties/",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
