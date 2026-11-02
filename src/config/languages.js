// SINGLE SOURCE OF TRUTH for every language the app can translate into.
// Served to the app by GET /api/languages and used here to derive the TTS
// catalog (config/voiceCatalog.js). Add a language by adding one row.
//
// tts:
//   "chirp3hd" - Google Chirp3-HD voices (8 personas, `locale` is the Google locale)
//   "override" - only Wavenet/Standard voices; per-voice map lives in voiceCatalog.js
//   "none"     - no Google voice: translated TEXT only ("Text reply only" in the app).
//                fa / zu / ga were ElevenLabs-only; they are text-only unless the
//                ELEVENLABS_ENABLED flag is turned on (see config/ttsProviders.js).
// beta: genuinely weak low-resource language (speech recognition and translation notably less accurate), shown with a small "Beta" tag. Keep this list SHORT (~20).
//
// Voice coverage was verified live against Google Cloud TTS listVoices on 2026-11-02.

const v = (code, name, native, locale, beta = false) => ({ code, name, native, tts: "chirp3hd", locale, beta });
const o = (code, name, native, locale, beta = false) => ({ code, name, native, tts: "override", locale, beta });
const t = (code, name, native, beta = false, elevenLabsFallback = false) => ({
  code, name, native, tts: "none", locale: null, beta, elevenLabsFallback,
});

export const LANGUAGES = [
  // --- Original 50 (order preserved: matches the app's old list) ---
  v("en", "English", "English", "en-US"),
  v("es", "Spanish", "Español", "es-ES"),
  v("fr", "French", "Français", "fr-FR"),
  v("de", "German", "Deutsch", "de-DE"),
  v("it", "Italian", "Italiano", "it-IT"),
  v("pt", "Portuguese", "Português", "pt-BR"),
  v("ru", "Russian", "Русский", "ru-RU"),
  v("uk", "Ukrainian", "Українська", "uk-UA"),
  v("nl", "Dutch", "Nederlands", "nl-NL"),
  v("pl", "Polish", "Polski", "pl-PL"),
  v("sv", "Swedish", "Svenska", "sv-SE"),
  v("no", "Norwegian", "Norsk", "nb-NO"),
  v("da", "Danish", "Dansk", "da-DK"),
  v("fi", "Finnish", "Suomi", "fi-FI"),
  v("el", "Greek", "Ελληνικά", "el-GR"),
  v("tr", "Turkish", "Türkçe", "tr-TR"),
  v("cs", "Czech", "Čeština", "cs-CZ"),
  v("hu", "Hungarian", "Magyar", "hu-HU"),
  v("ro", "Romanian", "Română", "ro-RO"),
  v("bg", "Bulgarian", "Български", "bg-BG"),
  v("ar", "Arabic", "العربية", "ar-XA"),
  v("he", "Hebrew", "עברית", "he-IL"),
  t("fa", "Persian", "فارسی", false, true),
  v("hi", "Hindi", "हिन्दी", "hi-IN"),
  v("pa", "Punjabi", "ਪੰਜਾਬੀ", "pa-IN"),
  v("bn", "Bengali", "বাংলা", "bn-IN"),
  v("gu", "Gujarati", "ગુજરાતી", "gu-IN"),
  v("mr", "Marathi", "मराठी", "mr-IN"),
  v("ta", "Tamil", "தமிழ்", "ta-IN"),
  v("te", "Telugu", "తెలుగు", "te-IN"),
  v("kn", "Kannada", "ಕನ್ನಡ", "kn-IN"),
  v("ml", "Malayalam", "മലയാളം", "ml-IN"),
  v("ur", "Urdu", "اردو", "ur-IN"),
  v("zh", "Chinese", "中文", "cmn-CN"),
  v("ja", "Japanese", "日本語", "ja-JP"),
  v("ko", "Korean", "한국어", "ko-KR"),
  v("vi", "Vietnamese", "Tiếng Việt", "vi-VN"),
  v("th", "Thai", "ไทย", "th-TH"),
  v("id", "Indonesian", "Bahasa Indonesia", "id-ID"),
  o("ms", "Malay", "Bahasa Melayu", "ms-MY"),
  o("tl", "Filipino", "Filipino", "fil-PH"),
  v("sw", "Swahili", "Kiswahili", "sw-KE"),
  o("am", "Amharic", "አማርኛ", "am-ET", true),
  t("zu", "Zulu", "isiZulu", true, true),
  o("af", "Afrikaans", "Afrikaans", "af-ZA"),
  o("ca", "Catalan", "Català", "ca-ES"),
  o("eu", "Basque", "Euskara", "eu-ES"),
  t("ga", "Irish", "Gaeilge", true, true),
  o("is", "Icelandic", "Íslenska", "is-IS"),
  v("sr", "Serbian", "Српски", "sr-RS"),

  // --- 8 new languages WITH Google voices (47 -> 55) ---
  v("et", "Estonian", "Eesti", "et-EE"),
  o("gl", "Galician", "Galego", "gl-ES"),
  v("hr", "Croatian", "Hrvatski", "hr-HR"),
  v("lt", "Lithuanian", "Lietuvių", "lt-LT"),
  v("lv", "Latvian", "Latviešu", "lv-LV"),
  v("sk", "Slovak", "Slovenčina", "sk-SK"),
  v("sl", "Slovenian", "Slovenščina", "sl-SI"),
  v("yue", "Cantonese", "粵語", "yue-HK"),

  // --- 52 new TEXT-ONLY languages ---
  t("hy", "Armenian", "Հայերեն"),
  t("az", "Azerbaijani", "Azərbaycanca"),
  t("be", "Belarusian", "Беларуская"),
  t("bs", "Bosnian", "Bosanski"),
  t("kk", "Kazakh", "Қазақша"),
  t("mk", "Macedonian", "Македонски"),
  t("ne", "Nepali", "नेपाली"),
  t("cy", "Welsh", "Cymraeg"),
  t("mi", "Maori", "Māori"),
  t("mt", "Maltese", "Malti"),
  t("sq", "Albanian", "Shqip"),
  t("ka", "Georgian", "ქართული"),
  t("lb", "Luxembourgish", "Lëtzebuergesch"),
  t("uz", "Uzbek", "Oʻzbekcha"),
  t("tg", "Tajik", "Тоҷикӣ"),
  t("tk", "Turkmen", "Türkmençe"),
  t("ky", "Kyrgyz", "Кыргызча"),
  t("mn", "Mongolian", "Монгол"),
  t("ps", "Pashto", "پښتو"),
  t("sd", "Sindhi", "سنڌي"),
  t("si", "Sinhala", "සිංහල"),
  t("my", "Burmese", "မြန်မာ"),
  t("km", "Khmer", "ខ្មែរ"),
  t("lo", "Lao", "ລາວ"),
  t("yo", "Yoruba", "Yorùbá", true),
  t("ha", "Hausa", "Hausa", true),
  t("ig", "Igbo", "Igbo", true),
  t("so", "Somali", "Soomaali", true),
  t("sn", "Shona", "chiShona", true),
  t("ln", "Lingala", "Lingála", true),
  t("mg", "Malagasy", "Malagasy", true),
  t("rw", "Kinyarwanda", "Kinyarwanda", true),
  t("xh", "Xhosa", "isiXhosa", true),
  t("st", "Sesotho", "Sesotho", true),
  t("tn", "Tswana", "Setswana", true),
  t("ti", "Tigrinya", "ትግርኛ", true),
  t("ht", "Haitian Creole", "Kreyòl ayisyen", true),
  t("jv", "Javanese", "Basa Jawa"),
  t("su", "Sundanese", "Basa Sunda"),
  t("as", "Assamese", "অসমীয়া"),
  t("or", "Odia", "ଓଡ଼ିଆ"),
  t("ku", "Kurdish", "Kurdî"),
  t("ug", "Uyghur", "ئۇيغۇرچە", true),
  t("yi", "Yiddish", "ייִדיש"),
  t("la", "Latin", "Latina"),
  t("br", "Breton", "Brezhoneg", true),
  t("oc", "Occitan", "Occitan"),
  t("fo", "Faroese", "Føroyskt"),
  t("tt", "Tatar", "Татарча"),
  t("ba", "Bashkir", "Башҡортса"),
  t("sa", "Sanskrit", "संस्कृतम्", true),
  t("bo", "Tibetan", "བོད་སྐད།", true),
];

// Bump when the list changes so the app can tell its bundled copy is stale.
export const LANGUAGES_VERSION = 1;
