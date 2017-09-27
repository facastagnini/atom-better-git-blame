import resolve from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'lib/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    sourcemap: false
  },
  external: ['https', 'atom', 'dgram', 'fs', 'child_process', 'crypto', 'path', 'os'],
  plugins: [
    replace({
      patterns: [
        {
          match: /formidable(\/|\\)lib/,
          test: 'if (global.GENTLY) require = GENTLY.hijack(require);',
          replace: '',
        },
        {
          match: /analytics-node\/index.js/,
          test: './package',
          replace: './package.json'
        }
      ]
    }),
    typescript({
      typescript: require('typescript')
    }),
    common({
      include: 'node_modules/**'
    }),
    json(),
    resolve(),
  ]
};
