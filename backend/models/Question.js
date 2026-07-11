const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: (arr) => arr.length >= 2,
    },
    correctIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
