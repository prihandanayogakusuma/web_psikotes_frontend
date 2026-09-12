import type { NextConfig } from "next";

const NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*", // Sesuaikan rute
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ]
      }
    ]
  }
}
// module.exports = NextConfig

export default NextConfig;
