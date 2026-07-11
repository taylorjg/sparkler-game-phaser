import { defineConfig } from 'vite'

export default defineConfig({
  base: '/sparkler-game-phaser/',
  define: {
    CANVAS_RENDERER: JSON.stringify(true),
    WEBGL_RENDERER: JSON.stringify(true)
  },
  server: {
    port: 3400
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['phaser', 'loglevel']
  }
})
