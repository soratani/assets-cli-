import { Configuration } from "webpack";
import { AbstractBuilder } from "./abstract.builder";


export class ReactBuilder extends AbstractBuilder {
    protected get config(): Configuration {
        console.log('1111', require.resolve('@babel/runtime'))
        return {
            module: {
                rules: [
                    {
                        test: /\.(js|ts)x?$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [
                                        require.resolve("@babel/preset-env"),
                                        require.resolve("@babel/preset-react"),
                                        require.resolve("@babel/preset-typescript"),
                                    ],
                                    cacheDirectory: true,
                                    cacheCompression: false,
                                    plugins: [
                                        require.resolve('@babel/plugin-transform-runtime'),
                                        require.resolve('@babel/plugin-transform-modules-commonjs'),
                                    ].filter(Boolean),
                                },
                            },
                        ],
                    },
                    
                ]
            },
            resolve: {
                extensions: [".js", ".jsx", ".ts", ".tsx", ".json", '.vue'],
                alias: {
                    '@babel/runtime': require.resolve('@babel/runtime'),
                }
            },
        }
    }
}