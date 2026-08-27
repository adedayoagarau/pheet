import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const token = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN;
    return token
      ? [
          {
            source: "/:path*",
            headers: [{ key: "Origin-Trial", value: token }],
          },
        ]
      : [];
  },
};

export default nextConfig;
