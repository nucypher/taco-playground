/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  distDir: 'out',    // Explicitly set output directory to 'out'
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || ''
};

export default nextConfig; 