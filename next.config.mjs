/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['kvwnpmdhyhrmfpgnojbh.supabase.co', 'wrivivjqxeulafrgdrsf.supabase.co', 'localhost'],
  },
};

export default nextConfig;
