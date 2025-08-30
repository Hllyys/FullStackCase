import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     remotePatterns: [
//       {
//         hostname: "*",
//       },
//     ],
//   },
// };


const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;", // önerilen CSP
  },
};

export default nextConfig; // (TS ise)
module.exports = nextConfig; // (JS ise)