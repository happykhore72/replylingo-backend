// When does a translate request NOT cost a credit?
//
// Only for a real failure: a REPLY in a language that normally has a voice,
// where the voice could not be produced (the provider failed), so the user
// has nothing to send. A reply in a text-only language ("Text reply only")
// is working as designed and costs 1 credit, same as a voice reply.
// Inbound translations always cost (the translated text is their main value).
export const shouldSkipCharge = ({ isReply, hasAudio, languageHasVoice }) =>
  Boolean(isReply && languageHasVoice && !hasAudio);
