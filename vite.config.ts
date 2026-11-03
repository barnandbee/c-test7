import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this project at https://<user>.github.io/c-test7/.
// If the repository is renamed, change this to match.
const BASE = "/c-test7/";

export default defineConfig({
  base: BASE,
  plugins: [
    preact(),
    VitePWA({
      // Ask before switching to a new version, so nothing reloads mid-edit.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["bass-moultapps-logo.jpg", "icons/apple-touch-icon.png", "icons/favicon-64.png"],
      manifest: {
        name: "Training week",
        short_name: "Training",
        description: "A weekly training pick list: runs, strength and mobility.",
        lang: "en-GB",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "portrait",
        background_color: "#f1e6cc",
        theme_color: "#1c2a3a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Everything the app needs to run offline, including the fonts.
        globPatterns: ["**/*.{js,css,html,woff2,png,jpg,svg,webmanifest}"],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
