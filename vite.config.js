import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/frontend',
  envDir: '../../', // Look for .env in project root
  server: {
    port: 3000
  },
  build: {
    outDir: '../../dist'
  }
});