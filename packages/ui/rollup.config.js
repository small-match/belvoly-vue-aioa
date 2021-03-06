import commonjs from 'rollup-plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import tsconfig from './tsconfig.json'

export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'umd',
            name: 'ui'
        },
        {
            file: 'dist/index.es.js',
            format: 'es'
        }
    ],
    plugins: [
        typescript(tsconfig),
        commonjs(),
        VuePlugin({
            styleInjector: '~' + 'vue-runtime-helpers/dist/inject-style/browser.js'
        })
    ],
    external: ['@belvoly-vue-aioa/core']
}
