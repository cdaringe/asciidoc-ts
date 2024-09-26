import { grammar as ohmGrammar } from "ohm-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnvVar } from "./env.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const grammarFilename = path.resolve(__dirname, "grammar.ohm");
export const grammarString = fs.readFileSync(grammarFilename, "utf8");
export const grammar = ohmGrammar(grammarString);
if (getEnvVar("DUMP_GRAMMAR")) {
  console.log(grammarString);
}
