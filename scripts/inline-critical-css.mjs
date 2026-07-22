import { readFile, readdir, unlink, writeFile } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url);
const assetsDir = new URL("./assets/", distDir);
const files = await readdir(assetsDir);
const cssFiles = files.filter((file) => file.endsWith(".css"));

if (cssFiles.length !== 1) {
  throw new Error(`Expected one generated CSS file, found ${cssFiles.length}.`);
}

const cssFile = cssFiles[0];
const css = await readFile(new URL(cssFile, assetsDir), "utf8");
const htmlPath = new URL("./index.html", distDir);
const html = await readFile(htmlPath, "utf8");
const stylesheetPattern = new RegExp(`<link rel="stylesheet" crossorigin href="/assets/${cssFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">`);

if (!stylesheetPattern.test(html)) {
  throw new Error("Generated stylesheet link was not found in dist/index.html.");
}

await writeFile(htmlPath, html.replace(stylesheetPattern, `<style>${css}</style>`));
await unlink(new URL(cssFile, assetsDir));
