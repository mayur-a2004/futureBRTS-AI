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
            },
            '/downloads': {
                target: 'http://127.0.0.1:7001',
                changeOrigin: true,
            }
        }
    },
    optimizeDeps: {
        include: ['mermaid', 'prismjs', 'framer-motion', 'lucide-react']
    }
})
