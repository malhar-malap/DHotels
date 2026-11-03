const { createProxyMiddleware } = require('http-proxy-middleware');

// Dev server only: forward API calls to the backend. Set BACKEND_URL when 8080 is taken by another app.
module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_URL || 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};
