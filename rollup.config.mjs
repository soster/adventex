import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/js/main.js',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs({
      include: ['node_modules/**','src/js/functions.js']
    }),
    production && terser()
  ]
};
