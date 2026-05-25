// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// In-memory store — shared within single Vite dev-server process
const demoStore: { event: unknown } = { event: null };

function demoWebhookPlugin(): Plugin {
  return {
    name: "demo-webhook",
    configureServer(server) {
      server.middlewares.use("/api/demo", (req, res, next) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        };

        if (req.method === "OPTIONS") {
          res.writeHead(204, headers);
          res.end();
          return;
        }

        if (req.method === "GET") {
          const event = demoStore.event;
          demoStore.event = null; // consume once
          res.writeHead(200, headers);
          res.end(JSON.stringify({ event }));
          return;
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              demoStore.event = JSON.parse(body);
            } catch {
              // ignore malformed JSON
            }
            res.writeHead(200, headers);
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }

        next();
      });
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [demoWebhookPlugin()],
  },
});
