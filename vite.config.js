import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'hosted-fields-sdk',
      // the proper extensions will be added
      fileName: 'hosted-fields-sdk',
      formats: ["es", "umd"]
    }
  },
  plugins: [
    // Eslint will try to find config files (eslint.config.mjs or eslint.config.js)
    eslint()
  ],
})