/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/portfolio/[id]/pdf": ["./node_modules/pdfkit/js/data/**"],
  },
};

export default nextConfig;
