import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/frontend',
  build: {
    outDir: '../../dist',  // This should output to root/dist
    emptyOutDir: true
  },
  envDir: '../../'
});