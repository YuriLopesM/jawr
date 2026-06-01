import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [100, 75],
    remotePatterns: [
      { protocol: 'https', hostname: 'singlecolorimage.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.scdn.co', pathname: '/**' },
      { protocol: 'https', hostname: 'r2.theaudiodb.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.theaudiodb.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'api.jawr.org', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'sean-fish-imageproxy.s3.us-west-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
