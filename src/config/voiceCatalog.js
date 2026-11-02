// Google Cloud TTS voice/language mapping. The language list lives in
// ./languages.js; this file derives the voice lookup tables from it (see the
// tier notes further down) and holds the 8 voice personas.
//
// Coverage was verified live against the real Google Cloud TTS API
// (client.listVoices({}) - 2066 voices across 63 locales) rather than assumed.

// The 8 voice ids the mobile app exposes in src/utils/voices.js. Keep these
// two files in sync — same ids, same order.
export const VOICE_PERSONAS = {
  female_1: "Kore",
  female_2: "Aoede",
  female_3: "Leda",
  female_4: "Zephyr",
  male_1: "Charon",
  male_2: "Fenrir",
  male_3: "Orus",
  male_4: "Puck",
};

export const DEFAULT_VOICE_ID = "male_1";

// Legacy values already stored in Mongo from the ElevenLabs-only era
// (User.voiceId default was "male", config/voices.js default was "female").
// Mapped forward so existing users never need a migration script.
const LEGACY_VOICE_ID_MAP = {
  male: "male_1",
  female: "female_1",
};

export function normalizeVoiceId(voiceId) {
  if (voiceId && VOICE_PERSONAS[voiceId]) return voiceId;
  if (voiceId && LEGACY_VOICE_ID_MAP[voiceId]) return LEGACY_VOICE_ID_MAP[voiceId];
  return DEFAULT_VOICE_ID;
}

export function isValidVoiceId(voiceId) {
  return Boolean(voiceId && (VOICE_PERSONAS[voiceId] || LEGACY_VOICE_ID_MAP[voiceId]));
}

// The language list itself now lives in ./languages.js (one row per language,
// also served to the app by GET /api/languages). This file only derives the
// Google TTS lookup tables from it.
//
// Three tiers (voice coverage verified live against Google Cloud TTS):
//  1. "chirp3hd" - the 8 universal natural-sounding personas above exist in
//     every one of these locales under the exact same name
//     (e.g. de-DE-Chirp3-HD-Kore).
//  2. "override" - only Wavenet/Standard tier is available, with fewer
//     distinct voices than the 4 female + 4 male persona slots; explicit
//     per-slot map below. Some (af, ca, eu, is, gl) have ONLY a single
//     female voice, so every slot resolves to it.
//  3. "none" - no Google voice. Translated TEXT only ("Text reply only").
//     fa / zu / ga were served by ElevenLabs; that fallback now exists only
//     behind the ELEVENLABS_ENABLED flag (config/ttsProviders.js, off by default).
import { LANGUAGES } from "./languages.js";
import { ELEVENLABS_ENABLED } from "./ttsProviders.js";

const SLOT_ORDER = ["female_1", "female_2", "female_3", "female_4", "male_1", "male_2", "male_3", "male_4"];
const slots = (...names) => Object.fromEntries(SLOT_ORDER.map((slot, i) => [slot, names[i]]));
const single = (name) => slots(name, name, name, name, name, name, name, name);

// Explicit voice maps for the "override" tier.
const OVERRIDE_VOICES = {
  ms: slots("ms-MY-Wavenet-A", "ms-MY-Wavenet-C", "ms-MY-Wavenet-A", "ms-MY-Wavenet-C",
            "ms-MY-Wavenet-B", "ms-MY-Wavenet-D", "ms-MY-Wavenet-B", "ms-MY-Wavenet-D"),
  am: slots("am-ET-Wavenet-A", "am-ET-Wavenet-A", "am-ET-Wavenet-A", "am-ET-Wavenet-A",
            "am-ET-Wavenet-B", "am-ET-Wavenet-B", "am-ET-Wavenet-B", "am-ET-Wavenet-B"),
  tl: slots("fil-PH-Wavenet-A", "fil-PH-Wavenet-B", "fil-PH-Wavenet-A", "fil-PH-Wavenet-B",
            "fil-PH-Wavenet-C", "fil-PH-Wavenet-D", "fil-PH-Wavenet-C", "fil-PH-Wavenet-D"),
  // Only one (female) voice exists for these - every slot resolves to it.
  af: single("af-ZA-Standard-A"),
  ca: single("ca-ES-Standard-B"),
  eu: single("eu-ES-Standard-B"),
  is: single("is-IS-Standard-B"),
  gl: single("gl-ES-Standard-B"),
};

export const LANGUAGE_CONFIG = Object.fromEntries(
  LANGUAGES.filter((l) => l.tts !== "none").map((l) => {
    if (l.tts === "chirp3hd") return [l.code, { tier: "chirp3hd", locale: l.locale }];
    const voices = OVERRIDE_VOICES[l.code];
    if (!voices) throw new Error(`languages.js: "${l.code}" is tts:"override" but has no OVERRIDE_VOICES entry.`);
    return [l.code, { tier: "override", locale: l.locale, voices }];
  })
);

// Languages with an optional ElevenLabs fallback (only used when the flag is on).
const ELEVENLABS_FALLBACK_LANGUAGES = new Set(
  LANGUAGES.filter((l) => l.elevenLabsFallback).map((l) => l.code)
);

// Every language code the app may send.
const KNOWN_CODES = new Set(LANGUAGES.map((l) => l.code));

// Defensive fallback for older app builds that only send the language NAME
// (e.g. "Chinese") instead of targetLanguageCode.
const NAME_TO_CODE = Object.fromEntries(LANGUAGES.map((l) => [l.name.toLowerCase(), l.code]));

// Used by the voice-preview endpoint (receives only a code) and the branding
// outro to get the English language name for the GPT translation prompt.
export const CODE_TO_NAME = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.name]));

export function resolveLanguageCode(targetLanguageCode, targetLanguageName) {
  if (targetLanguageCode && KNOWN_CODES.has(targetLanguageCode)) {
    return targetLanguageCode;
  }
  const normalizedName = (targetLanguageName || "").trim().toLowerCase();
  return NAME_TO_CODE[normalizedName] || "en";
}

/** True when this language can be spoken (Google voice, or ElevenLabs fallback when enabled). */
export function hasVoice(targetLanguageCode, targetLanguageName) {
  const code = resolveLanguageCode(targetLanguageCode, targetLanguageName);
  if (LANGUAGE_CONFIG[code]) return true;
  return ELEVENLABS_ENABLED && ELEVENLABS_FALLBACK_LANGUAGES.has(code);
}

/**
 * Resolves a (languageCode, voiceId) pair to a Google Cloud TTS locale+voice
 * name, to the (flagged, off by default) ElevenLabs fallback, or to
 * { provider: "none" } meaning "translated text only, no audio".
 */
export function resolveVoice(targetLanguageCode, targetLanguageName, voiceId) {
  const code = resolveLanguageCode(targetLanguageCode, targetLanguageName);
  const normalizedVoiceId = normalizeVoiceId(voiceId);
  const config = LANGUAGE_CONFIG[code];

  if (!config) {
    if (ELEVENLABS_ENABLED && ELEVENLABS_FALLBACK_LANGUAGES.has(code)) {
      // ElevenLabs only knows "female"/"male" - reduce our 8-value id to its gender.
      const elevenLabsVoiceId = normalizedVoiceId.startsWith("female") ? "female" : "male";
      return { provider: "elevenlabs", languageCode: code, voiceId: elevenLabsVoiceId };
    }
    return { provider: "none", languageCode: code };
  }

  if (config.tier === "chirp3hd") {
    const persona = VOICE_PERSONAS[normalizedVoiceId];
    return {
      provider: "google",
      locale: config.locale,
      voiceName: `${config.locale}-Chirp3-HD-${persona}`,
    };
  }

  // "override" tier
  return {
    provider: "google",
    locale: config.locale,
    voiceName: config.voices[normalizedVoiceId],
  };
}
