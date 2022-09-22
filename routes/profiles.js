const router = require("express").Router();
const User = require("../models/User");
const PatientInfo = require("../models/PatientInfo");
const Image = require("../models/profilePic");
var multer = require("multer");
const { userAuth, checkRole } = require("../util/auth");
var path = require("path");
router.get(
  "/patientDatas",
  userAuth,
  checkRole(["admin", "physician"]),
  async (req, res) => {
    const errors = {};
    await User.find({ role: "Patient" })
      .then((profiles) => {
        if (!profiles) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }

        const data = profiles.map((a) => ({
          user_id: a._id,
          email: a.email,
          name: a.name,
          dob: a.dob,
          phone: a.phone,
          createdAt: a.createdAt,
          appointment: a.appointment,
        }));
        res.json(data);
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.get(
  "/physicianDatas",
  userAuth,
  checkRole(["admin", "Patient"]),
  async (req, res) => {
    const errors = {};
    await User.find({ role: "physician" })
      .then((profiles) => {
        if (!profiles) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }

        const data = profiles.map((a) => ({
          user_id: a._id,
          email: a.email,
          name: a.name,
          speciality: a.speciality,
          dob: a.dob,
          phone: a.phone,
          createdAt: a.createdAt,
        }));
        res.json(data);
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.delete(
  "/deletePatientDatas/:user_id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    const errors = {};
    await User.findOneAndRemove({ _id: req.params.user_id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user to delete";
          return res.status(404).json(errors);
        }
        res.json({ success: true });
        console.log(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);
router.delete(
  "/deletePhysicianDatas/:user_id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    const errors = {};
    await User.findOneAndRemove({ _id: req.params.user_id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user to delete";
          return res.status(404).json(errors);
        }
        res.json({ success: true });
        console.log(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.post(
  "/appointment/:user_id",
  userAuth,
  checkRole(["Patient"]),
  async (req, res) => {
    const errors = {};
    await User.find({
      role: "Patient",
      appointment: {
        $elemMatch: {
          physician: req.body.physician,
          date: req.body.date,
        },
      },
    }).then((dateNotAvaliable) => {
      // console.log(dateNotAvaliable);

      if (dateNotAvaliable.length > 0) {
        errors.noprofile = "This time slot is not available ";
        return res.status(404).json(errors);
      }
      PatientInfo.findOne({ user: req.params.user_id }).then((profile) => {
        if (!profile) {
          errors.noprofile =
            "Please add Your Demographics and Medication details before booking appointment";
          return res.status(404).json(errors);
        }
        User.findOne({ _id: req.params.user_id })
          .then((profile) => {
            if (!profile) {
              errors.noprofile =
                "There is no profile for this user to add appointment";
              return res.status(404).json(errors);
            }
            const newAppoint = {
              speciality: req.body.speciality,
              physician: req.body.physician,
              date: req.body.date,
            };

            profile.appointment.unshift(newAppoint);
            profile.save().then((profile) => res.json(profile));
          })
          .catch((err) => res.status(404).json(err));
      });
    });
  }
);

router.get(
  "/appointmentDetail/:user_id",
  userAuth,
  checkRole(["Patient", "admin", "physician"]),

  async (req, res) => {
    const errors = {};
    await User.findOne({ _id: req.params.user_id })

      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user ";
          return res.status(404).json(errors);
        }

        const data = profile.appointment.map((obj) => ({
          appoint_id: obj._id,
          speciality: obj.speciality,
          physician: obj.physician,
          date: obj.date,
          appointment_status: obj.appointment_status,
          noteFromDoc: obj.noteFromDoc,
        }));
        res.json(data);
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.delete(
  "/deleteAppointment/:user_id/:appoint_id",
  userAuth,
  checkRole(["Patient", "admin"]),
  async (req, res) => {
    const errors = {};
    await User.findOne({ _id: req.params.user_id })
      .then((profile) => {
        // Get remove index
        const removeIndex = profile.appointment
          .map((item) => item.id)
          .indexOf(req.params.appoint_id);

        // Splice out of array
        profile.appointment.splice(removeIndex, 1);
        // Save
        profile.save().then((profile) => res.json(profile));
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.patch(
  "/Approval/:user_id/:appoint_id",
  userAuth,
  checkRole(["admin"]),

  async (req, res) => {
    const user_id = req.params.user_id;
    const appoint_id = req.params.appoint_id;
    // console.log(user_id);
    // console.log(appoint_id);
    await User.updateOne(
      { _id: user_id },
      {
        $set: {
          "appointment.$[i].appointment_status": req.body.appointment_status,
        },
      },
      { arrayFilters: [{ "i._id": appoint_id }] }
    );
    // console.log(JSON.stringify(req.body.appointment_status));
    res.json("success");
  }
);
router.post(
  "/patientDemographics/:user_id",
  userAuth,
  checkRole(["Patient"]),
  async (req, res) => {
    // Get fields
    const errors = {};
    const patientFields = {};
    patientFields.user = req.params.user_id;
    if (req.body.firstName) patientFields.firstName = req.body.firstName;
    if (req.body.lastName) patientFields.lastName = req.body.lastName;
    if (req.body.gender) patientFields.gender = req.body.gender;
    if (req.body.email) patientFields.email = req.body.email;
    if (req.body.address) patientFields.address = req.body.address;
    if (req.body.race) patientFields.race = req.body.race;
    if (req.body.education) patientFields.education = req.body.education;
    if (req.body.employment) patientFields.employment = req.body.employment;
    if (req.body.medicalHistory)
      patientFields.medicalHistory = req.body.medicalHistory;
    if (req.body.familyMedicalHistory)
      patientFields.familyMedicalHistory = req.body.familyMedicalHistory;
    if (req.body.surgeries) patientFields.surgeries = req.body.surgeries;

    await PatientInfo.findOne({ user: req.params.user_id }).then((profile) => {
      if (profile) {
        // Update
        PatientInfo.findOneAndUpdate(
          { user: req.params.user_id },
          { $set: patientFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        // Check if email matches
        User.findOne({ email: patientFields.email }).then((profile) => {
          // Save PatientInfo
          new PatientInfo(patientFields)
            .save()
            .then((profile) => res.json(profile));
          return;
        });
      }
    });
  }
);

router.post(
  "/medicationDetails/:user_id",
  userAuth,
  checkRole(["Patient"]),
  async (req, res) => {
    const errors = {};
    await PatientInfo.findOne({ user: req.params.user_id }).then((profile) => {
      if (!profile) {
        errors.msg = "Please Fill Your Demographics Details first";
        res.status(400).json(errors);
      }
      const newMed = {
        currentMedication: req.body.currentMedication,
        otc: req.body.otc,
        med: req.body.med,
        socialDrug: req.body.socialDrug,
        pastMed: req.body.pastMed,
        allergies: req.body.allergies,
        covidVacin: req.body.covidVacin,
        otherAllergies: req.body.otherAllergies,
      };

      // Add to exp array
      profile.medicationDetails.unshift(newMed);

      profile.save().then((profile) => res.json(profile));
    });
  }
);

router.get(
  "/getPatientDemographics/:user_id",
  userAuth,
  checkRole(["physician", "Patient"]),
  async (req, res) => {
    const errors = {};
    await PatientInfo.find({ user: req.params.user_id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no Patient Demographics for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);
router.get(
  "/getMedicationDetails/:user_id",
  userAuth,
  checkRole(["physician", "Patient"]),
  async (req, res) => {
    const errors = {};
    await PatientInfo.findOne({ user: req.params.user_id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no Medication Details for this user";
          return res.status(404).json(errors);
        }

        const data = profile.medicationDetails.map((a) => ({
          currentMedication: a.currentMedication,
          otc: a.otc,
          med: a.med,
          socialDrug: a.socialDrug,
          pastMed: a.pastMed,
          allergies: a.allergies,
          covidVacin: a.covidVacin,
          otherAllergies: a.otherAllergies,
        }));
        res.json(data);
      })
      .catch((err) => res.status(404).json(err));
  }
);

router.get("/dataSource/:docName", async (req, res) => {
  await User.find({ role: "Patient" }).then((profiles) => {
    if (!profiles) {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    }
    const patientAppoinment = [];

    const data = profiles.map(function (a) {
      if (a.appointment.length > 0) {
        const name = a.name;
        a.appointment.forEach((element) => {
          if (
            element.physician == req.params.docName &&
            element.appointment_status == "Approved"
          ) {
            patientAppoinment.push({
              Subject: "Appointment With " + name,
              Location: "MindSpace 3 Mumbai ",
              StartTime: element.date,
              EndTime: dateTransformFn(element.date),
            });
          }
        });
      }
      return patientAppoinment;
    });
    res.json(patientAppoinment);
  });
});
function dateTransformFn(date) {
  let dateVal = date;
  if (typeof date == "string") {
    dateVal = new Date(date);
    dateVal.setMinutes(dateVal.getMinutes() + 30);
  }
  return dateVal;
}
router.patch(
  "/physicianNote/:user_id/:appoint_id",
  userAuth,
  checkRole(["physician"]),

  async (req, res) => {
    const user_id = req.params.user_id;
    const appoint_id = req.params.appoint_id;
    console.log(user_id);
    console.log(appoint_id);
    await User.updateOne(
      { _id: user_id },
      {
        $set: {
          "appointment.$[i].noteFromDoc": req.body.noteFromDoc,
        },
      },
      { arrayFilters: [{ "i._id": appoint_id }] }
    ).then((profile) => res.status(200).json(profile));
  }
);

// Save file to server storage
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images");
  },
  filename: (req, file, callback) => {
    // console.log(file);
    var filetype = "";
    if (file.mimetype === "image/gif") {
      filetype = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    }
    callback(null, "image-" + Date.now() + "." + filetype);
  },
});

var upload = multer({ storage: storage });

// post data
router.post("/uploadImg/:user_id", upload.single("file"), (req, res, next) => {
  const errors = {};
  User.findOne({ _id: req.params.user_id }).then((profile) => {
    if (!profile) {
      errors.noprofile = "There is no profile for this user to add Image";
      return res.status(404).json(errors);
    }
    if (!req.file) {
      errors.img = "Upload fail";
      return res.status(500).json(errors);
    }
    Image.findOne({ user: req.params.user_id }).then((profile) => {
      if (!profile) {
        Image.create(
          {
            user: req.params.user_id,
            imageUrl: (req.body.imageUrl =
              " http://localhost:5001/images/" + req.file.filename),
            imageTitle: req.body.imageTitle,
            imageDesc: req.body.imageDesc,
          },

          function (err, gallery) {
            if (err) {
              console.log(err);
              return res.status(404).json(err);
            }
            return res.status(201).json({
              message: "Image uploaded successfully",
              gallery,
            });
          }
        );
      }
      if (profile) {
        // Update
        Image.findOneAndUpdate(
          { user: req.params.user_id },
          {
            $set: {
              imageUrl: (req.body.imageUrl =
                " http://localhost:5001/images/" + req.file.filename),
            },
          }
        ).then((profile) => res.json(profile));
      }
    });
  });
});

// // get data by id
router.get("/getProfilePic/:user", async (req, res) => {
  const errors = {};
  await Image.findOne({ user: req.params.user })
    .then((data) => {
      // console.log(data);
      if (!data) {
        errors.noprofile = "User has't uploaded a profile picture";
        return res.status(404).json(errors);
      }
      res.json(data.imageUrl);
    })
    .catch((err) => res.status(404).json(err));
});

router.get("/dataSources/:docName/:status", async (req, res) => {
  await User.find({ role: "Patient" }).then((profiles) => {
    if (!profiles) {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    }
    const patientAppoinment = [];

    const data = profiles.map(function (a) {
      if (a.appointment.length > 0) {
        const name = a.name;
        a.appointment.forEach((element) => {
          if (
            element.physician == req.params.docName &&
            element.appointment_status == req.params.status
          ) {
            patientAppoinment.push({
              Subject: "Appointment With " + name,
              Location: "MindSpace 3 Mumbai ",
              StartTime: element.date,
              EndTime: dateTransformFn(element.date),
            });
          }
        });
      }
      return patientAppoinment;
    });
    res.json(patientAppoinment);
  });
});

router.get("/AppoimentRecords", async (req, res) => {
  await User.find({ role: "Patient" }).then((profiles) => {
    let totalAppointments = 0;
    let pendingAppointments = 0;
    let approvedAppointment = 0;
    let rejectedAppointments = 0;
    const data = profiles.map((a) => {
      for (let i = 0; i < a.appointment.length; i++) {
        if (a.appointment[i].appointment_status == "Approved") {
          approvedAppointment++;
        }

        if (a.appointment[i].appointment_status == "Pending") {
          pendingAppointments++;
        }

        if (a.appointment[i].appointment_status == "Rejected") {
          rejectedAppointments++;
        }
        totalAppointments++;
      }
    });

    const patientAppoinment = [];
    patientAppoinment.push({
      totalAppointments: totalAppointments,
      approvedAppointment: approvedAppointment,
      pendingAppointments: pendingAppointments,
      rejectedAppointments: rejectedAppointments,
    });
    res.json(patientAppoinment);
  });
});
module.exports = router;
