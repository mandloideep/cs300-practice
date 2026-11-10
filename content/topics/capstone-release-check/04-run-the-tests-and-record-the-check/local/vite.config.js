import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/shop-release/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.js",
  },
});
