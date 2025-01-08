import { Configuration, webpack } from "webpack";
import merge from 'webpack-merge';
import Server from "webpack-dev-server";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import EslintWebpackPlugin from "eslint-webpack-plugin";
import TerserWebpackPlugin from "terser-webpack-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import { join } from "path";
import { ApplicationConfig, ENV, FindType } from "../config";
import { usePort } from "@app/utils";
import { Logger } from "./logger";


export abstract class AbstractBuilder {
    constructor(
        protected type: FindType,
        protected app: string,
        protected options: ApplicationConfig
    ) { }

    protected get baseConfig(): Configuration {
        const dev = [ENV.development].includes(this.options.env!);
        const mode = dev ? "development" : "production";
        const app = this.options.find(this.type, this.app);
        return {
            mode,
            cache: true,
            devtool: dev ? "inline-source-map" : false,
            entry: join(app.path, app.entry),
            output: {
                path: app.output,
                filename: "static/[name].[contenthash:8].js",
                chunkFilename: "static/[name].[contenthash:8].chunk.js",
                clean: true,
                publicPath: "/"
            },
            plugins: [
                new CleanWebpackPlugin(),
                new EslintWebpackPlugin({
                    context: app.path,
                    cache: true,
                }),
            ],
            optimization: {
                minimize: true,
                usedExports: true,
                minimizer: [
                    new CssMinimizerWebpackPlugin(),
                    new TerserWebpackPlugin({
                        terserOptions: {
                            compress: {
                                drop_console: true, // 移除所有的`console`语句
                            },
                            output: {
                                comments: false, // 去掉注释
                            },
                        },
                        parallel: 2,
                    }),
                ],
            }
        }
    }

    protected abstract get config(): Configuration
    public async start() {
        const instance = webpack(merge(this.baseConfig, this.config));
        const port = await usePort(3000, '0.0.0.0');
        instance.getInfrastructureLogger = () => new Logger();
        const server = new Server({}, instance);
    }
    public build() {
        webpack(merge(this.baseConfig, this.config), (error, status) => {
            console.log('>>>>>');
        })
    }
}