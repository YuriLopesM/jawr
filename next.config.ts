import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      new URL('https://singlecolorimage.com/**'),
      new URL('https://i.scdn.co/**'),
      new URL('https://r2.theaudiodb.com/**'),
      new URL('https://www.theaudiodb.com/**'),
      new URL('https://upload.wikimedia.org/**'),
    ],
  },
};

export default nextConfig;
