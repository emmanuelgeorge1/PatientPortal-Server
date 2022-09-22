const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    speciality: { type: String, required: false },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: Number, required: true },
    role: {
      type: String,
      enum: ["Patient", "admin", "physician"],
      default: "Patient",
    },
    appointment: [
      {
        speciality: { type: String, required: true },
        physician: { type: String, required: true },
        date: { type: String, required: true },
        appointment_status: {
          type: String,
          default: "Pending",
        },
        noteFromDoc: { type: String, required: false },
      },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);

module.exports = model("Users", UserSchema);
