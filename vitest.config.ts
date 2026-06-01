import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      app: path.resolve(__dirname),
      src: path.resolve(__dirname, 'src'),
      lib: path.resolve(__dirname, 'lib')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts']
  }
})
