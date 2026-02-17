const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "2026-02-17"
      required: true,
      unique: true
    },
    produced: {
      type: Number,
      default: 0
    },
    supplied: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

stockSchema.virtual("remaining").get(function () {
  return this.produced - this.supplied;
});

module.exports = mongoose.model("Stock", stockSchema);
