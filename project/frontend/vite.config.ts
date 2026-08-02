import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        global: 'window',
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:7001',
                changeOrigin: true,
                ws: true,
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        proxyReq.removeHeader('accept-encoding'); // prevent gzip buffering
                    });
                },
            },
            '/downloads': {
                target: 'http://127.0.0.1:7001',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://127.0.0.1:7001',
                changeOrigin: true,
            }
        }
    },
    optimizeDeps: {
        include: ['mermaid', 'prismjs', 'framer-motion', 'lucide-react']
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-icons': ['lucide-react'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-utils': ['axios', 'clsx', 'tailwind-merge']
                }
            }
        }
    }
})
