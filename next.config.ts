import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production') {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) throw new Error('Set NEXT_PUBLIC_API_BASE_URL before building for production.');
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.origin !== configured || url.username || url.password)
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be an HTTPS origin without a trailing slash.');
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
