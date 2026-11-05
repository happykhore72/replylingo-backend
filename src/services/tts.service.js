import { generateSpeech as generateSpeechGoogle } from "./googleTts.service.js";
import { resolveVoice } from "../config/voiceCatalog.js";

/**
 * Single entry point the rest of the backend calls for TTS. Routes to Google
 * Cloud TTS for every language it covers. Languages Google has no voice for
 * ("Text reply only" languages, tts:"none" in config/languages.js) get NO audio
 * call at all: this returns null immediately.
 *
 * ElevenLabs is not part of this pipeline unless ELEVENLABS_ENABLED=true (see
 * config/ttsProviders.js, off by default); only then do fa/zu/ga use it. It is
 * imported lazily so the module is never even loaded while the flag is off.
 *
 * Returns a Buffer, or null if audio can't be produced (text-only language, or
 * the provider failing after a retry) - callers treat null as "text-only, no
 * audio", never as an error to surface.
 */
export const generateTranslatedSpeech = async (
  text,
  targetLanguageCode,
  targetLanguageName,
  voiceId
) => {
  const resolved = resolveVoice(targetLanguageCode, targetLanguageName, voiceId);

  if (resolved.provider === "none") {
    return null;
  }

  if (resolved.provider === "elevenlabs") {
    try {
      const { generateSpeech: generateSpeechElevenLabs } = await import("./elevenlabs.service.js");
      return await generateSpeechElevenLabs(text, resolved.voiceId);
    } catch (error) {
      console.error(
        `TTS fallback (ElevenLabs) failed for language "${resolved.languageCode}", degrading to text-only:`,
        error.message
      );
      return null;
    }
  }

  // Google TTS: retry once (most failures are transient), then degrade to
  // text-only rather than failing the whole request - by this point Whisper
  // and the translation already succeeded and the user can still read them.
  // Each attempt is logged separately in AiCallLog, so failures stay visible.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await generateSpeechGoogle(text, targetLanguageCode, targetLanguageName, voiceId);
    } catch (error) {
      console.error(`Google TTS attempt ${attempt}/2 failed:`, error.message);
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  // Google failed twice: fall back to ElevenLabs (when an API key is set)
  // before degrading to text-only.
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const { generateSpeech: generateSpeechElevenLabs } = await import("./elevenlabs.service.js");
      // ElevenLabs only knows "female"/"male"; our ids are e.g. "female_1".
      const gender = String(voiceId || "").toLowerCase().startsWith("male") ? "male" : "female";
      const audio = await generateSpeechElevenLabs(text, gender);
      console.log(`TTS: ElevenLabs fallback succeeded for locale "${resolved.locale}".`);
      return audio;
    } catch (error) {
      console.error(`TTS fallback (ElevenLabs) failed for locale "${resolved.locale}":`, error.message);
    }
  } else {
    console.error("TTS: Google failed and ELEVENLABS_API_KEY is not set, no fallback available.");
  }

  console.error(
    `TTS failed for locale "${resolved.locale}", degrading to text-only.`
  );
  return null;
};
