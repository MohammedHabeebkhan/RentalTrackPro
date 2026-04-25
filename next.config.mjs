/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'utf-8-validate',
        'bufferutil': 'bufferutil',
        'supports-color': 'supports-color',
      });
    }
    return config;
  },
};

export default nextConfig;
