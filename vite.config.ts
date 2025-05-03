import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
    plugins: () => [react()]  // Wrap in arrow function
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist/build/pdf.worker.entry']
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/]
    }
  }
});