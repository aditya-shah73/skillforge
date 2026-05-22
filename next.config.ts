import type { NextConfig } from "next";

// Conservative security headers. The site is a static educational app with
// no user input persisted to a backend, but these still close common foot-guns:
//   - X-Content-Type-Options: blocks MIME sniffing (prevents an HTML response
//     being interpreted as JS in some browsers).
//   - Referrer-Policy: avoids leaking the full path of /courses/.../modules/...
//     pages in the Referer header on outbound links.
//   - X-Frame-Options: disables clickjacking via <iframe> embedding.
//   - Permissions-Policy: explicitly disable browser features we don't use,
//     so a future XSS can't quietly turn on the camera/mic.
// We deliberately do NOT ship a Content-Security-Policy here yet — Next 16's
// inline-script bootstrap + Geist font CSS make a strict CSP non-trivial and
// adding a permissive one is worse than none. Revisit when we have a real
// reason to lock down script-src.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
