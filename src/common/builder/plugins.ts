import { WebpackPluginInstance } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackTagsPlugin from "html-webpack-tags-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import webpack, { DefinePlugin } from "webpack";
import EslintWebpackPlugin from "eslint-webpack-plugin";
import dotenv from 'dotenv';
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { Application, ApplicationConfig } from "../config";
import { findFiles } from "@app/utils";
import { join } from "path";
import { readFileSync } from "fs";

export default function plugins(app: Application, config: ApplicationConfig): WebpackPluginInstance[] {
    let cssFilename = "static/style/[name].[contenthash:8].css";
    let cssChunkFilename = "static/style/[id].[contenthash:8].chunk.css";
    const instances: WebpackPluginInstance[] = [
        new CleanWebpackPlugin(),
        new EslintWebpackPlugin({
            context: app.path,
            cache: true,
        }),
        new MiniCssExtractPlugin({
            filename: cssFilename,
            chunkFilename: cssChunkFilename,
        }),
        new webpack.ProvidePlugin({
            React: "react", // 这样在任何地方都可以直接使用React，无需import
            ReactDOM: "react-dom",
        }),
    ];
    const assets = findFiles(app.public);
    const templateDir = join(__dirname, "../../../templates");
    const templateContent = readFileSync(
        join(templateDir, `${config.type}.html`)
    ).toString();
    const publicFiles = new HtmlWebpackTagsPlugin({
        links: assets.filter((file) => file.includes(".css")),
        tags: assets.filter((file) => file.includes(".js")),
        append: false,
    });
    // const copy = new CopyWebpackPlugin({
    //     patterns: [
    //         {
    //             from: app.public,
    //             to: app.output,
    //             filter(filepath: string) {
    //                 return !filepath.includes(".html");
    //             },
    //         },
    //     ],
    // });
    const template = new HtmlWebpackPlugin({
        templateContent,
        filename: "index.html",
        inject: "head",
    });
    // instances.push(copy);
    instances.push(template);
    instances.push(publicFiles);
    return instances;
}