// The app sends one random key per user action (record/upload) and re-sends
// the SAME key on every retry of that action. Header first (so the limit
// middleware can see it before multer parses the body), form field as a
// fallback in case a proxy strips custom headers.
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

export const getIdempotencyKey = (req) => {
  const raw = req.get("x-idempotency-key") || req.body?.idempotencyKey;
  return typeof raw === "string" && KEY_PATTERN.test(raw) ? raw : null;
};
