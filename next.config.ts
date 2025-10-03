import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://learn.futureproofmusicschool.com',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

