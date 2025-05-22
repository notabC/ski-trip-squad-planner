import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for use in the config
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy all requests to /api/liteapi to the actual liteAPI endpoint
        '/api/liteapi': {
          target: 'https://api.liteapi.travel',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/liteapi/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', function(proxyReq, req, _res, _options) {
              // Add the API key header to the proxied request
              // Check for both VITE_LITE_API_KEY and LITE_API_KEY (for Vercel compatibility)
              const apiKey = env.VITE_LITE_API_KEY || process.env.VITE_LITE_API_KEY || '';
              console.log(`Adding API key to request: ${apiKey ? '(key found)' : '(no key)'}`);
              console.log(`Environment variables available: ${Object.keys(env).join(', ')}`);
              console.log(`Proxy request URL: ${req.url}`);
              console.log(`Request headers:`, req.headers);
              
              // Always add accept header
              proxyReq.setHeader('accept', 'application/json');
              
              if (apiKey) {
                // Use the correct header name for API v3.0
                proxyReq.setHeader('X-API-Key', apiKey);
                console.log('API key header set on proxy request');
              }
            });
            
            // Log responses
            proxy.on('proxyRes', function (proxyRes, req, _res) {
              console.log(`Proxy response for ${req.url}: ${proxyRes.statusCode}`);
              console.log(`Response headers:`, proxyRes.headers);
            });
          }
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
