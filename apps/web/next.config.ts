import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fleetops/types', '@fleetops/utils', '@fleetops/validation'],
};

export default nextConfig;
