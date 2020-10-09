import resolve from 'rollup-plugin-node-resolve'

export default {
  input: './index.js',
  output: {
    dir: './dist/',
    format: 'esm',
    name: 'bundle'
  },
  plugins: [
    resolve({
      main:true
    }),
  ],
  external: [
    '@akkadu/rtc-streamer-producer',
    '@akkadu/logger',
    '@akkadu/error',
    'validate.js'
  ],
}
