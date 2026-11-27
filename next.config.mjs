/** @type {import('next').NextConfig} */
const preview = process.env.NEXT_PUBLIC_PREVIEW === '1';
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  // Stable id between deploys: only files whose content changed need uploading.
  generateBuildId: async () => process.env.SRO_BUILD_ID || null,
  reactStrictMode: true,
  // Shareable preview only: a placeholder prefix that scripts/make-preview.mjs turns into relative paths.
  ...(preview ? { assetPrefix: '/__SRO__' } : {}),
};
export default nextConfig;
