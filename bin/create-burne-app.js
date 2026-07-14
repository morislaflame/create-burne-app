#!/usr/bin/env node
import { createRequire } from "node:module";
import { run } from "../src/index.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

run(process.argv.slice(2), version).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
