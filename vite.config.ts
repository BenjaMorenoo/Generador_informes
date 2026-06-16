import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'docx', '@react-pdf/renderer'],
  },
});
