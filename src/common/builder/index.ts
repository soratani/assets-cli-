import { Configuration, webpack } from "webpack";
import merge from 'webpack-merge';
import Server from "webpack-dev-server";
import { join } from "path";
import { usePort } from "@app/utils";
import { ApplicationConfig } from "../config";
import config from "./config";
import { Logger } from "./logger";


export class Builder {
    constructor(private readonly option: ApplicationConfig) {
        
    }

    /**
     * 启动应用
     * @param app 
     */
    async start(name: string) {
        const app = this.option.find('app', name);
        await app.load();
        const instance = webpack(config(app, this.option));
        const port = await usePort(3000, '0.0.0.0');
        instance.getInfrastructureLogger = () => new Logger();
        const server = new Server({}, instance);
    }

    build(name: string) {
        const app = this.option.find('app', name);
        const instance = merge(config(app, this.option), {
            entry: join(app.path, app.entry),
            output: {
                path: app.output,
                filename: "static/[name].[contenthash:8].js",
                chunkFilename: "static/[name].[contenthash:8].chunk.js",
                clean: true,
                publicPath: "/"
            }
        })
        console.log(instance)
        webpack(instance, (error, stats) => {
            console.log(error, stats);
        });
    }

    compress(name: string) {
        const app = this.option.find('app', name);
    }
}