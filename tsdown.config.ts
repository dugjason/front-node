import { defineConfig } from "tsdown";

export default defineConfig({
  attw: true,
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  sourcemap: true,
});
