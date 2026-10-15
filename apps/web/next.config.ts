import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (a real Postgres compiled to WASM) runs the local database with no install; keep it out of the bundler.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // Lets a phone on the home Wi-Fi open the dev server (http://<this Mac's LAN IP>:3000). Dev only; has no effect in production.
  // In development never let a phone reuse an old stylesheet or script: always fetch the current one.
  headers: () =>
    Promise.resolve(process.env.NODE_ENV === "production" ? [] : [{ source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] }]),
  allowedDevOrigins: ["192.168.1.115", "192.168.*.*"],
  // Pages taken down on 15 Oct 2026 (kept whole on the branch archive/before-cleanup-2026-10-15): old links land on the live page instead of an error.
  redirects: () =>
    Promise.resolve([
      { source: "/superseded", destination: "/", permanent: true },
      { source: "/3d-store", destination: "/", permanent: true },
      { source: "/product", destination: "/piece/heavy-bag", permanent: true },
      { source: "/bag-letters", destination: "/", permanent: true },
      { source: "/how-it-works", destination: "/#how", permanent: true },
      { source: "/configure/parts", destination: "/configure", permanent: true },
    ]),
};

export default nextConfig;
