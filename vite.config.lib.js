import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Library build configuration
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.js'),
      name: 'VirtualBudtender',
      formats: ['es', 'umd'],
      fileName: (format) => `virtual-budtender.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['react', 'react-dom'],
      output: {
        // Global variables to use in UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Preserve the CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name;
        }
      }
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Clear output directory before build
    emptyOutDir: true
  },
  css: {
    postcss: './postcss.config.js'
  }
})

