import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the home Wi-Fi open the dev server (http://<this Mac's LAN IP>:3000). Dev only; has no effect in production.
  allowedDevOrigins: ["192.168.1.115", "192.168.*.*"],
};

export default nextConfig;
