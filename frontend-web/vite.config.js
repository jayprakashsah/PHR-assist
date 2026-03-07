import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    extensions: [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
    ],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
    global: "window",
  },
});
