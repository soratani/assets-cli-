import autoprefixer from "autoprefixer";
import pxtorem from "postcss-pxtorem";
import { RuleSetRule } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { ApplicationConfig } from "../config";

const reactBabel: any = {
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
};

export const autoPrefixer = autoprefixer();
export const pxToRem = pxtorem({
    rootValue: 16, // 基准值（浏览器默认字体大小为 16px）
    unitPrecision: 5, // 单位精度
    propList: ["*"], // 要转换的属性列表，'*' 表示所有单位为 px 的属性都会被转换
    selectorBlackList: [], // 忽略不需要转换的选择器
    replace: true, // 是否替换包含 rem 的属性值而不是添加 fallback
    mediaQuery: true, // 允许在媒体查询中转换 px
    minPixelValue: 0, // 设置最小转换数值，小于这个值的 px 不会被转换
});

export function createAssetLoader(maxSize = 8 * 1024) {
    const filename = "static/image/[name].[contenthash:8][ext]";
    return {
        test: /\.(png|jpe?g|gif|webp|svg|ico)$/,
        type: "asset",
        parser: {
            dataUrlCondition: {
                maxSize,
            },
        },
        generator: {
            filename,
        },
    };
}

export function createMediaLoader() {
    const filename = "static/media/[name].[contenthash:8][ext]";
    return {
        test: /\.(woff2?|eot|ttf|otf|mp3|mp4|avi|mkv)$/i,
        type: "asset/resource",
        generator: {
            filename,
        },
    };
}


export function createPostcssLoader(plugins: any[] = []) {
    const postcssOptions: any = { plugins: [] };
    if (plugins.length) {
        postcssOptions.plugins = plugins;
        return { loader: "postcss-loader", options: { postcssOptions } };
    }
    return "postcss-loader";
}

export function createLessLoader() {
    return {
        loader: "less-loader",
        options: {
            lessOptions: {
                javascriptEnabled: true,
            },
        },
    };
}

export function createCssLoader(module = false) {
    const options = {
        esModule: false,
        modules: {
            auto: true,
            exportGlobals: true,
        },
    };
    if (module) {
        return { loader: "css-loader", options };
    }
    return "css-loader";
}

export default function loader(config: ApplicationConfig): RuleSetRule[] {
    const styleLess: any = {
        test: /\.(css|less)$/,
        exclude: /\.module\.(css|less)$/,
        use: [
            MiniCssExtractPlugin.loader,
            createCssLoader(),
            createPostcssLoader(["postcss-preset-env", autoPrefixer, pxToRem]),
            createLessLoader(),
        ],
    };
    const styleModuleLess: any = {
        test: /\.module.(css|less)$/,
        use: [
            MiniCssExtractPlugin.loader,
            createCssLoader(true),
            createPostcssLoader(["postcss-preset-env", autoPrefixer, pxToRem]),
            createLessLoader(),
        ],
    };

    const list = [reactBabel, createAssetLoader(), createMediaLoader()];
    return list.concat([styleLess, styleModuleLess]);
}