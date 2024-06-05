import { defineConfig } from 'vite';
import packageJson from './package.json';

export default defineConfig({
  define: {
    __APP_VERSION : JSON.stringify(packageJson.version),
    __APP_DESCRIPTION : JSON.stringify(packageJson.description),
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'markdown-metadata',
      fileName: (format) => `markdown-metadata.${format}.js`,
    },
    rollupOptions: {
      external: ['gray-matter', 'markdown-it', 'commander'],
      output: {
        globals: {
          'gray-matter': 'grayMatter',
          'markdown-it': 'markdownIt',
          'commander': 'commander'
        },
      },
    },
  },
});