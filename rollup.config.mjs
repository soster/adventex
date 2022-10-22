import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import { terser } from "rollup-plugin-terser";
//replacement because terser needs rollup 2 as a dependency:
import { terser } from "rollup-plugin-minification";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false

const production = !process.env.ROLLUP_WATCH;

export default {
	input: ['src/js/main.js'],
    
	output: {
		file: 'dist/js/main.js',
		format: 'umd', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
		resolve({
			jsnext: true,
			main: true,
			browser: true,
		  }),
		  commonjs({
			include: ['node_modules/**','src/js/functions.js']
		 }),
		production && terser() // minify, but only in production
	]
};