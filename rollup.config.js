import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/sn-socket.min.js',
    format: 'umd',
    name: 'SNSocket',
  },
  plugins: [typescript(), commonjs(), terser()],
};

export default config;
