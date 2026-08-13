import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // A stuck old Service Worker is the classic "keeps showing the old
      // site no matter how many times I refresh" trap: browsers normally
      // only re-check a Service Worker script every 24h, and if this file
      // itself gets served from a stale cache, the self-destruct code
      // inside it never even reaches the browser. Forcing no-cache here
      // means every time the browser DOES check, it gets the real, current
      // version — not a cached copy of an older check.
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, must-revalidate' }],
      },
    ]
  },
};

export default nextConfig;
