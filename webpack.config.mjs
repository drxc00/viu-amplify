import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const require = createRequire(import.meta.url);

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "production",
  target: "web",
  entry: {
    contentScript: "./src/content/index.ts",
    background: "./src/background/index.ts",
    react: "./src/app/main.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve("manifest.json"), to: path.resolve("dist") },
        { from: path.resolve("src/static/logo.png"), to: path.resolve("dist") },
      ],
    }),
    new MiniCssExtractPlugin({ filename: "styles.css" }),
  ],
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS into a separate file
          "css-loader", // Loads CSS into JavaScript
          "postcss-loader", // Processes CSS with Tailwind & Autoprefixer
        ],
      },
    ],
  },
  resolve: {
    alias: {
      scheduler: require.resolve("scheduler"),
    },
    extensions: [".ts", ".tsx"],
  },
  stats: {
    all: false, // Disable all logs
    errors: true, // Show errors only
    warnings: true, // Show warnings only
    timings: true, // Show build timings
    assets: true, // Show output assets
    builtAt: true, // Show build timestamp
  },
};
