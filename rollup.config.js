import { babel } from '@rollup/plugin-babel';
import OMT from "@surma/rollup-plugin-off-main-thread";
import obfuscator from 'rollup-plugin-obfuscator';

const config = {
    input: 'src/main-promo.js',
    output: {
        dir: 'output',
        format: 'esm'
    },
    plugins: [babel(), OMT(), obfuscator({
        fileOptions: {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 0,
            reservedStrings: ["promo-worker.*\.js"]
        },
    })],
};

export default config;