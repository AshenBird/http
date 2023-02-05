const fs = require("fs-extra");
const { resolve } = require("path");
const esbuild = require("esbuild");
const { dtsPlugin } = require("esbuild-plugin-d.ts");

// 清空输出目录
fs.emptyDirSync(resolve(__dirname, "../dist"));

// 通用构建配置
const commonProps = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  tsconfig: "tsconfig.json",
  plugins: [dtsPlugin()], // 生成类型描述文件插件
};

// 导入配置
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

// 最小化配置
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
  // 生成四种输出文件
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
