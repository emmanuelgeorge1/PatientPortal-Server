const { Schema, model } = require("mongoose");

const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  id: String,
  imageUrl: String,
  imageTitle: String,
  imageDesc: String,
  uploaded: { type: Date, default: Date.now },
});

module.exports = model("Image", profileSchema);
