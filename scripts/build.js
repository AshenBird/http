const fs = require("fs-extra");
const { resolve } = require("path");
const esbuild = require("esbuild");
const { dtsPlugin } = require("esbuild-plugin-d.ts");
fs.emptyDirSync(resolve(__dirname, "../dist"));

// 通用构建配置
const commonProps = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  tsconfig: "tsconfig.json",
  plugins: [dtsPlugin()],
};

// 构建格式
const formatModes = [
  {
    fileName: "",
    mode: "iife",
  },
  {
    fileName: ".esm",
    mode: "esm",
  },
];
const minifyModes = [
  {
    fileName: "",
    mode: false,
  },
  {
    fileName: ".min",
    mode: true,
  },
];
// 执行构建
(async () => {
  for (const formatConf of formatModes) {
    for (const minifyConf of minifyModes) {
      esbuild.build({
        ...commonProps,
        outfile: `dist/index${formatConf.fileName}${minifyConf.fileName}.js`,
        format: `${formatConf.mode}`,
        minify: minifyConf.mode,
      });
    }
  }
})().catch((e) => {
  console.log(e);
});
