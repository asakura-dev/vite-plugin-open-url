import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginOpenUrl from "vite-plugin-open-url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginOpenUrl({
      paths: ["/", "/home", "/about", "/contact", "/setting"],
      url: ({ target, defaultUrl }) => {
        switch (target) {
          case "android":
            return `${defaultUrl}?platform=android`;
          case "ios":
            return `${defaultUrl}?platform=ios`;
          case "web":
            return defaultUrl;
        }
      },
    }),
  ],
});
