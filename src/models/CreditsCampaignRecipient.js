import mongoose from "mongoose";

// One row per user in a one-off "free credits back" style campaign. The
// unique (campaign, uid) index is the hard guarantee that nobody is pushed
// twice, and it is the join key for the 7-day impact report
// (GET /api/admin/credits-back-report).
const schema = new mongoose.Schema(
  {
    campaign: { type: String, required: true },
    uid: { type: String, required: true },
    platform: { type: String, default: null },
    language: { type: String, default: "en" }, // locale actually used for the push
    languageKnown: { type: Boolean, default: false },
    hadToken: { type: Boolean, default: false },
    blockedByDevice: { type: Boolean, default: false }, // shared device still blocks them -> no push
    pushEligible: { type: Boolean, default: false },
    creditsResetAt: { type: Date, default: null },
    // reset | pending | sending | sent | failed | skipped
    status: { type: String, default: "reset" },
    sentAt: { type: Date, default: null },
    ticketId: { type: String, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

schema.index({ campaign: 1, uid: 1 }, { unique: true });
schema.index({ campaign: 1, status: 1 });

export default mongoose.model("CreditsCampaignRecipient", schema);
