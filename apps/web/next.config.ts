import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (a real Postgres compiled to WASM) runs the local database with no install; keep it out of the bundler.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // Lets a phone on the home Wi-Fi open the dev server (http://<this Mac's LAN IP>:3000). Dev only; has no effect in production.
  allowedDevOrigins: ["192.168.1.115", "192.168.*.*"],
};

export default nextConfig;
