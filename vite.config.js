import { defineConfig } from 'vite';
import htmlPartials from './plugins/html-partials.js';

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    // three.js (~690 kB) is a lazy chunk that only loads near the 3D section
    chunkSizeWarningLimit: 800,
    target: 'es2022',
    rollupOptions: {
      output: {
        // keep animation libraries and three.js in their own long-cached chunks
        manualChunks: {
          motion: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
        },
      },
    },
  },
});
