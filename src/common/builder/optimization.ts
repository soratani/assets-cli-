import TerserWebpackPlugin from "terser-webpack-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";

export default function optimization() {
    const opt: any = {
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
    };
    return opt;
}