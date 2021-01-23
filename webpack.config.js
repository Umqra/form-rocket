/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const webpack = require("webpack");

module.exports = function (env) {
    return {
        context: __dirname,
        entry: { root: require.resolve("./src/index.ts") },
        output: {
            path: path.resolve(__dirname, "dist"),
            publicPath: "/dist/",
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    use: {
                        loader: require.resolve("babel-loader"),
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            modules: ["node_modules"],
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        plugins: [],
        mode: "development",
        devServer: {
            hot: true,
            host: "0.0.0.0",
            port: 8080,
            proxy: {
                "/db-viewer/**": {
                    target: "http://localhost:5000/",
                },
                "*": {
                    secure: false,
                    bypass: () => "/public/index.html",
                },
            },
            stats: {
                colors: true,
                hash: false,
                version: false,
                timings: true,
                assets: false,
                chunks: false,
                modules: false,
                reasons: false,
                children: false,
                source: false,
                errors: true,
                errorDetails: true,
                warnings: true,
                publicPath: false,
            },
        },
    };
};
