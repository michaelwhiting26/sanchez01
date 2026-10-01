import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The production build type-checks without the tests (see tsconfig.build.json); `npm run typecheck` covers them.
  typescript: { tsconfigPath: "tsconfig.build.json" },
  // PGlite (a real Postgres compiled to WASM) runs the local database with no install; keep it out of the bundler.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // Lets a phone on the home Wi-Fi open the dev server (http://<this Mac's LAN IP>:3000). Dev only; has no effect in production.
  // In development never let a phone reuse an old stylesheet or script: always fetch the current one.
  headers: () =>
    Promise.resolve(process.env.NODE_ENV === "production" ? [] : [{ source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] }]),
  allowedDevOrigins: ["192.168.1.115", "192.168.*.*"],
};

export default nextConfig;
