// Writes the same payload GET /api/languages serves to a JSON file, for bundling
// into the mobile app as the offline/first-launch copy.
//   node scripts/export-languages.mjs ../../../../../rn/ReplyLingo-Mobile/src/data/languages.json
import fs from "node:fs";
import path from "node:path";
import { LANGUAGES, LANGUAGES_VERSION } from "../src/config/languages.js";
import { hasVoice } from "../src/config/voiceCatalog.js";

const out = process.argv[2];
if (!out) throw new Error("usage: node scripts/export-languages.mjs <output.json>");
const languages = LANGUAGES.map((l) => ({
  code: l.code, name: l.name, native: l.native, voice: hasVoice(l.code), beta: Boolean(l.beta),
}));
const payload = { version: LANGUAGES_VERSION, total: languages.length, voiceCount: languages.filter((l) => l.voice).length, languages };
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 1) + "\n");
console.log(`wrote ${languages.length} languages (${payload.voiceCount} with voice) to ${out}`);
