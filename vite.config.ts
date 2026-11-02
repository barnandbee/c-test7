import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

// GitHub Pages serves this project at https://<user>.github.io/c-test7/.
// If the repository is renamed, change this to match.
export default defineConfig({
  base: "/c-test7/",
  plugins: [preact()],
  test: {
    environment: "node",
  },
});
