const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Initialize Next.js instance
const app = next({ 
    dev,
    hostname,
    port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Set security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
            res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
            
            // Enable CORS with specific origins
            const allowedOrigins = [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'https://megaskyshop.com'
            ];
            const origin = req.headers.origin;
            
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const parsedUrl = parse(req.url, true);
            
            // Handle the request
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            
            const errorResponse = {
                error: 'Internal Server Error',
                message: dev ? err.message : 'An error occurred',
                ...(dev && { stack: err.stack })
            };
            
            res.statusCode = err.statusCode || 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(errorResponse));
        }
    })
    .once('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
    })
    .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Mode: ${dev ? 'development' : 'production'}`);
    });
})
.catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
});