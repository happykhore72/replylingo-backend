// Sanity checks for the language registry + TTS routing.
//   node scripts/verify-languages.mjs            offline checks
//   node scripts/verify-languages.mjs --live     also checks every voice name against Google listVoices
import "dotenv/config";
import assert from "node:assert/strict";
import { LANGUAGES } from "../src/config/languages.js";
import { LANGUAGE_CONFIG, VOICE_PERSONAS, resolveVoice, resolveLanguageCode, hasVoice, CODE_TO_NAME } from "../src/config/voiceCatalog.js";
import { generateTranslatedSpeech } from "../src/services/tts.service.js";

const codes = LANGUAGES.map((l) => l.code);
assert.equal(new Set(codes).size, codes.length, "duplicate language codes");
assert.equal(new Set(LANGUAGES.map((l) => l.name.toLowerCase())).size, codes.length, "duplicate English names");
const voice = LANGUAGES.filter((l) => hasVoice(l.code));
const textOnly = LANGUAGES.filter((l) => !hasVoice(l.code));
console.log(`total=${LANGUAGES.length} voice=${voice.length} textOnly=${textOnly.length} beta=${LANGUAGES.filter((l) => l.beta).length}`);
assert.equal(LANGUAGES.length, 110);
const flagOn = String(process.env.ELEVENLABS_ENABLED).toLowerCase() === "true";
assert.equal(voice.length, flagOn ? 58 : 55); // flag on: fa/zu/ga speak through ElevenLabs again
assert.equal(textOnly.length, flagOn ? 52 : 55);
for (const l of LANGUAGES) assert.ok(l.native && l.name, `missing names for ${l.code}`);

// the original 50 keep their codes and the original 47 keep their voices
const original = "en es fr de it pt ru uk nl pl sv no da fi el tr cs hu ro bg ar he fa hi pa bn gu mr ta te kn ml ur zh ja ko vi th id ms tl sw am zu af ca eu ga is sr".split(" ");
assert.deepEqual(codes.slice(0, 50), original);
const originalTextOnly = ["fa", "zu", "ga"];
for (const c of original) assert.equal(hasVoice(c), flagOn || !originalTextOnly.includes(c), `voice regression for ${c}`);

// resolver behaviour
assert.equal(resolveVoice("fa", "Persian", "female_1").provider, flagOn ? "elevenlabs" : "none");
assert.equal(resolveVoice("yo", "Yoruba", "male_1").provider, "none");        // would previously fall back to English
assert.equal(resolveLanguageCode("yo", "Yoruba"), "yo");
assert.equal(resolveLanguageCode(undefined, "Chinese"), "zh");                // old app: name only
assert.equal(resolveLanguageCode("xx", "Klingon"), "en");                     // unknown keeps old fallback
assert.equal(resolveVoice("hr", "Croatian", "female_1").voiceName, "hr-HR-Chirp3-HD-Kore");
assert.equal(resolveVoice("yue", "Cantonese", "male_1").voiceName, "yue-HK-Chirp3-HD-Charon");
assert.equal(resolveVoice("gl", "Galician", "male_3").voiceName, "gl-ES-Standard-B");
assert.equal(resolveVoice("de", "German", "female_2").voiceName, "de-DE-Chirp3-HD-Aoede");
assert.equal(CODE_TO_NAME.sk, "Slovak");
// text-only language: no TTS call at all, returns null
assert.equal(await generateTranslatedSpeech("hola", "yo", "Yoruba", "female_1"), null);
if (!flagOn) assert.equal(await generateTranslatedSpeech("x", "fa", "Persian", "female_1"), null);
console.log("offline checks OK");

if (process.argv.includes("--live")) {
  const { googleTtsClient } = await import("../src/config/googleTts.js");
  const [r] = await googleTtsClient.listVoices({});
  const names = new Set(r.voices.map((v) => v.name));
  let n = 0;
  for (const c of Object.keys(LANGUAGE_CONFIG)) {
    for (const id of Object.keys(VOICE_PERSONAS)) {
      const rv = resolveVoice(c, "", id);
      assert.ok(names.has(rv.voiceName), `Google has no voice ${rv.voiceName} (${c}/${id})`);
      n++;
    }
  }
  console.log(`live check OK: ${n} (language, persona) voice names exist at Google`);
}

// ElevenLabs flag: run `ELEVENLABS_ENABLED=true node scripts/verify-languages.mjs --flag` to confirm fa switches back on.
if (process.argv.includes("--flag")) {
  assert.equal(resolveVoice("fa", "Persian", "female_2").provider, "elevenlabs");
  assert.equal(resolveVoice("yo", "Yoruba", "female_2").provider, "none");
  console.log("flag-on checks OK");
}
