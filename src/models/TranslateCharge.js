import mongoose from "mongoose";

// One document per *charged* translate request, keyed by the idempotency key
// the app generates for a user action (and re-sends on every automatic or
// manual retry of that same action). The unique (uid, key) index is what
// makes "charge at most once per action" atomic: the first request to insert
// the document does the charge, any retry hitting a duplicate-key error
// skips it. Documents expire on their own after a day.
const translateChargeSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
});

translateChargeSchema.index({ uid: 1, key: 1 }, { unique: true });

export default mongoose.model("TranslateCharge", translateChargeSchema);
