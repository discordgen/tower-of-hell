import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import OMT from "@surma/rollup-plugin-off-main-thread";
import obfuscator from 'rollup-plugin-obfuscator';

const config = {
    input: 'src/main-promo.js',
    output: {
        dir: 'output',
        format: 'esm'
    },
    plugins: [babel(), obfuscator({
        fileOptions: {
            // Your javascript-obfuscator options here
            // Will be applied on each file separately. Set to `false` to disable
            // See what's allowed: https://github.com/javascript-obfuscator/javascript-obfuscator
        },
        globalOptions: {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: false,
            simplify: true,
            stringArrayShuffle: false,
            splitStrings: false,
            stringArrayThreshold: 0
        },
    }), OMT()],
};

export default config;