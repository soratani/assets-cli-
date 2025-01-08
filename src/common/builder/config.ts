import { Configuration } from "webpack";
import { resolve } from "path";
import { Application, ApplicationConfig, ENV } from "../config";
import loader from "./loaders";
import optimization from "./optimization";
import plugins from "./plugins";


export default function config(app: Application, config: ApplicationConfig): Configuration {
    const dev = [ENV.development].includes(config.env!);
    const mode = dev ? "development" : "production";
    console.log(loader(config));
    return {
        mode,
        cache: true,
        devtool: dev ? "inline-source-map" : false,
        module: {
            rules: loader(config)
        },
        plugins: plugins(app, config),
        optimization: optimization(),
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json", '.vue'],
            alias: {
                '@babel/runtime': resolve(__dirname, '../../../node_modules/@babel/runtime'),
            }
        },
        performance: {
            hints: false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },
        stats: false
    }
}