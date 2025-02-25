/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript during production builds
    ignoreBuildErrors: true,
  },
  output: 'export',  // Enable static exports
  distDir: 'out',    // Explicitly set output directory to 'out'
};

module.exports = nextConfig; 