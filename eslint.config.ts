import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
  { name: "app/files-to-lint", files: ["**/*.{ts,mts,tsx,vue,js}"] },
  { name: "app/files-to-ignore", ignores: ["dist/**", "dev-dist/**", "coverage/**"] },
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    // The bookmarklet runs as a standalone script on app.bricks.co.
    files: ["src/bridge/bookmarklet-source.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        location: "readonly",
        fetch: "readonly",
        alert: "readonly",
        URL: "readonly",
      },
    },
  },
  skipFormatting,
);
