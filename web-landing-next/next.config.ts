import path from 'path';
import type { NextConfig } from 'next';

/** Next.js config — landing is served by `src/app/page.tsx`, not static HTML. */
const nextConfig: NextConfig = {
  // Monorepo layout: keep module resolution scoped to this app directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
