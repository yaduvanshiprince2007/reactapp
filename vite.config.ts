import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base:"./",
  build: {
    target: 'esnext', // Ensures modern JS compatibility
    minify: 'terser', // Uses Terser for minification\
    terserOptions: {
      compress: {
        drop_console: true,  // Removes console.log, console.warn, console.error, etc.
        drop_debugger: true, // Removes debugger statements
      },
      mangle: true, // Obfuscates variable names
      format: {
        comments: false, // Removes comments
      },
    },
    assetsInlineLimit: 0, // Avoids inlining assets
    rollupOptions: {
      output: {
        format: 'iife', // Wraps code into an Immediately Invoked Function Expression (IIFE)
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  }
})
