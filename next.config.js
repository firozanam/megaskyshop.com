/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['megaskyshop.com', 'localhost', '127.0.0.1'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '9iuwrme1pfmpwt7q.public.blob.vercel-storage.com'
            },
            {
                protocol: 'https',
                hostname: 'blob.vercel-storage.com'
            },
            {
                protocol: 'https',
                hostname: 'miro.medium.com'
            },
            {
                protocol: 'http',
                hostname: 'localhost'
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1'
            },
            {
                protocol: 'https',
                hostname: 'steadfast.com.bd'
            },
            {
                protocol: 'https',
                hostname: 'megaskyshop.com'
            }
        ],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    env: {
        BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
        NEXT_PUBLIC_BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    },
    poweredByHeader: false,
    compress: true,
    optimizeFonts: true,
    swcMinify: true,
    reactStrictMode: true,
    experimental: {
        optimizeCss: false,
    },
    webpack: (config, { isServer, dev }) => {
        // Custom webpack config for better cPanel compatibility
        if (!isServer && !dev) {
            // Optimize client-side bundle for cPanel environment
            config.optimization = {
                ...config.optimization,
                minimize: true,
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000,
                    maxSize: 244000,
                    minChunks: 1,
                    maxAsyncRequests: 30,
                    maxInitialRequests: 30,
                    cacheGroups: {
                        defaultVendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            reuseExistingChunk: true,
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true,
                        },
                    },
                },
            };
        }
        return config;
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    }
                ]
            }
        ];
    },
    async rewrites() {
        return {
            beforeFiles: [
                // Handle API routes
                {
                    source: '/api/:path*',
                    destination: '/api/:path*',
                },
                // Handle Next.js image optimization
                {
                    source: '/_next/image/:path*',
                    destination: '/_next/image/:path*',
                },
            ],
            afterFiles: [
                // Handle dynamic routes
                {
                    source: '/:path*',
                    destination: '/:path*',
                },
            ],
        };
    },
};

module.exports = nextConfig;
