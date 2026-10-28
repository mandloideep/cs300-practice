import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/cs300-practice/",
  plugins: [react()],
  optimizeDeps: {
    // The runner harness is a second dev-only page; scanning it up front avoids a reload when
    // Vite first meets its dependencies.
    entries: ["index.html", "src/runner/harness/index.html"],
  },
});
