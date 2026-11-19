// vite.config.ts
import { defineConfig } from "file:///C:/Users/Admin/.gemini/antigravity/futurebuilderlatest%20grok%20last/futurebuilderlatest/project/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Admin/.gemini/antigravity/futurebuilderlatest%20grok%20last/futurebuilderlatest/project/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\.gemini\\antigravity\\futurebuilderlatest grok last\\futurebuilderlatest\\project\\frontend";
var vite_config_default = defineConfig({
  define: {
    global: "window"
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7001",
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("accept-encoding");
          });
        }
      },
      "/downloads": {
        target: "http://127.0.0.1:7001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:7001",
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ["mermaid", "prismjs", "framer-motion", "lucide-react"]
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-icons": ["lucide-react"],
          "vendor-motion": ["framer-motion"],
          "vendor-utils": ["axios", "clsx", "tailwind-merge"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFwuZ2VtaW5pXFxcXGFudGlncmF2aXR5XFxcXGZ1dHVyZWJ1aWxkZXJsYXRlc3QgZ3JvayBsYXN0XFxcXGZ1dHVyZWJ1aWxkZXJsYXRlc3RcXFxccHJvamVjdFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcLmdlbWluaVxcXFxhbnRpZ3Jhdml0eVxcXFxmdXR1cmVidWlsZGVybGF0ZXN0IGdyb2sgbGFzdFxcXFxmdXR1cmVidWlsZGVybGF0ZXN0XFxcXHByb2plY3RcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluLy5nZW1pbmkvYW50aWdyYXZpdHkvZnV0dXJlYnVpbGRlcmxhdGVzdCUyMGdyb2slMjBsYXN0L2Z1dHVyZWJ1aWxkZXJsYXRlc3QvcHJvamVjdC9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6ICd3aW5kb3cnLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjcwMDEnLFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmU6IChwcm94eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ2FjY2VwdC1lbmNvZGluZycpOyAvLyBwcmV2ZW50IGd6aXAgYnVmZmVyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnL2Rvd25sb2Fkcyc6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6NzAwMScsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICcvdXBsb2Fkcyc6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6NzAwMScsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgaW5jbHVkZTogWydtZXJtYWlkJywgJ3ByaXNtanMnLCAnZnJhbWVyLW1vdGlvbicsICdsdWNpZGUtcmVhY3QnXVxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcclxuICAgICAgICBjc3NNaW5pZnk6IHRydWUsXHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3ZlbmRvci1pY29ucyc6IFsnbHVjaWRlLXJlYWN0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3ZlbmRvci1tb3Rpb24nOiBbJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICAgICAgICAgICAgICAndmVuZG9yLXV0aWxzJzogWydheGlvcycsICdjbHN4JywgJ3RhaWx3aW5kLW1lcmdlJ11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1ZixTQUFTLG9CQUFvQjtBQUNwaEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixRQUFRO0FBQUEsSUFDSixRQUFRO0FBQUEsRUFDWjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLElBQUk7QUFBQSxRQUNKLFdBQVcsQ0FBQyxVQUFVO0FBQ2xCLGdCQUFNLEdBQUcsWUFBWSxDQUFDLGFBQWE7QUFDL0IscUJBQVMsYUFBYSxpQkFBaUI7QUFBQSxVQUMzQyxDQUFDO0FBQUEsUUFDTDtBQUFBLE1BQ0o7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2xCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLFNBQVMsQ0FBQyxXQUFXLFdBQVcsaUJBQWlCLGNBQWM7QUFBQSxFQUNuRTtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ1gsUUFBUTtBQUFBLFFBQ0osY0FBYztBQUFBLFVBQ1YsZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGdCQUFnQixDQUFDLGNBQWM7QUFBQSxVQUMvQixpQkFBaUIsQ0FBQyxlQUFlO0FBQUEsVUFDakMsZ0JBQWdCLENBQUMsU0FBUyxRQUFRLGdCQUFnQjtBQUFBLFFBQ3REO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
