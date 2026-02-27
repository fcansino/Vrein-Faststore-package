import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      graphql: 'src/graphql/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    minify: true,
    sourcemap: true,
    splitting: false,
    clean: true,
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'next',
      /^next\/.*/,
      '@faststore/ui',
      /^@faststore\/.*/,
      'swr',
    ],
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
    loader: {
      '.scss': 'css',
    },
  },
])
