import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname || __dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname || __dirname, './src')
      }
    },
    define: {
      'process.env': {},
      'global': 'globalThis'
    },
    server: {
      port: 3000,
      host: true
    }
  };
});