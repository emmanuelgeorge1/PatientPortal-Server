const { Schema, model } = require("mongoose");

const patientSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    address: { type: String, required: true },
    race: { type: String, required: true },
    education: { type: String, required: true },
    employment: { type: String, required: false },
    medicalHistory: { type: String, required: true },
    familyMedicalHistory: { type: String, required: true },
    surgeries: { type: String, required: false },

    medicationDetails: [
      {
        currentMedication: { type: String, required: true },
        otc: { type: String, required: false },
        med: { type: String, required: false },
        socialDrug: { type: String, required: false },
        pastMed: { type: String, required: true },
        allergies: { type: String, required: true },
        covidVacin: { type: String, required: true },
        otherAllergies: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = Profile = model("Patients", patientSchema);
