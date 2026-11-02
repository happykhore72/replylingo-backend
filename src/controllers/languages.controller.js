import { LANGUAGES, LANGUAGES_VERSION } from "../config/languages.js";
import { hasVoice } from "../config/voiceCatalog.js";

// Built once at startup: the list is static config, not database content.
const payload = (() => {
  const languages = LANGUAGES.map((l) => ({
    code: l.code,
    name: l.name,
    native: l.native,
    // true = translated replies are also spoken. false = "Text reply only".
    voice: hasVoice(l.code),
    // true = low-resource language, shown with a small "Beta" tag.
    beta: Boolean(l.beta),
  }));
  return {
    success: true,
    version: LANGUAGES_VERSION,
    total: languages.length,
    voiceCount: languages.filter((l) => l.voice).length,
    languages,
  };
})();

// GET /api/languages - public (no auth): the language picker needs it before
// sign-in. Cacheable: Express adds an ETag, so unchanged lists answer 304.
export const getLanguages = (req, res) => {
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json(payload);
};
