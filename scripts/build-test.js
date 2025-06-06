#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function buildForTest() {
  try {
    await build({
      entryPoints: [
        "src/types/jsonSchema.ts",
        "src/utils/jsonValidator.ts",
        "src/utils/schemaExample.ts",
        "src/lib/schema-inference.ts",
      ],
      outdir: "dist-test",
      bundle: true,
      platform: "neutral",
      format: "esm",
      sourcemap: true,
      target: "node18",
      external: ["zod", "ajv", "ajv-formats"],
    });
  } catch (e) {
    console.error("Build failed:", e);
    process.exit(1);
  }
}

buildForTest();
