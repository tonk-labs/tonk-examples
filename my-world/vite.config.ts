import { defineConfig, loadEnv } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      wasm(), 
      topLevelAwait(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "service-worker.ts",
        registerType: "autoUpdate",
        injectRegister: null, // We're manually registering in serviceWorkerRegistration.ts
        manifest: {
          name: "My World",
          short_name: "MyWorld",
          description: "A tinyfoot application",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: "module"
        }
      })
    ],
    // Configure server to serve .wasm files with the correct MIME type
    assetsInclude: ['**/*.wasm'],
    resolve: {
      alias: {
        // Add any path aliases if needed
      },
    },
    server: {
      port: 3000,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
      middlewareMode: false,
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      },
      proxy: {
        "/sync": {
          target: "http://localhost:4080",
          ws: true,
          changeOrigin: true,
        },
        "/api": {
          target: "http://localhost:4080",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      target: "esnext",
      // Ensure proper WASM handling during build
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
    },
    define: {
      // Replace process.env.NODE_ENV with the appropriate mode
      "process.env.NODE_ENV": JSON.stringify(mode),
      // Make env variables available as import.meta.env
      ...Object.keys(env).reduce((prev, key) => {
        prev[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        return prev;
      }, {}),
    },
    optimizeDeps: {
      // Exclude WASM modules from optimization
      exclude: ["@automerge/automerge-wasm"],
      esbuildOptions: {
        target: "esnext",
        supported: {
          bigint: true,
        },
      },
    },
  };
});
