import { defineConfig } from 'vite';

export default defineConfig({
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