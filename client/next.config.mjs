import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  fallbacks: {
    document: "/offline", // offline fallback page
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // 4. Exclude sensitive data from caching (Network Only)
      {
        urlPattern: /\/api\/(medical-records|payments|auth|admin).*/i,
        handler: 'NetworkOnly',
      },
      // 3. API requests & Dynamic routes (Network First)
      {
        urlPattern: /\/api\/.*|^\/dashboard.*|^\/login.*|^\/register.*|^\/profile.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'dynamic-routes-and-apis',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      // 1. Static Assets (Cache First)
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // 2. CSS, JS, Fonts (Stale While Revalidate)
      {
        urlPattern: /\.(?:js|css|woff2?|eot|ttf|otf)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Default fallback
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'default-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      }
    ],
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA(nextConfig);
