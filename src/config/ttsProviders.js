// Feature flags for text-to-speech providers.
//
// ElevenLabs is OFF by default: it is not used anywhere in the voice pipeline.
// Languages Google Cloud TTS has no voice for (fa, zu, ga and every other
// language flagged tts:"none" in config/languages.js) return translated TEXT
// only. To switch the old fallback back on (e.g. after moving to a commercial
// ElevenLabs plan), set ELEVENLABS_ENABLED=true in the environment; fa/zu/ga
// then speak through ElevenLabs again exactly as before. No code change needed.
export const ELEVENLABS_ENABLED = String(process.env.ELEVENLABS_ENABLED || "").toLowerCase() === "true";
