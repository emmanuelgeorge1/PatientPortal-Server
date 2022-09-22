const router = require("express").Router();
//bring registeration function

const {
  userRegister,
  userLogin,
  userAuth,
  checkRole,
} = require("../util/auth");

//Registration route
router.post("/register-Patient", async (req, res) => {
  await userRegister(req.body, "Patient", res);
});
router.post("/register-admin", async (req, res) => {
  await userRegister(req.body, "admin", res);
});
router.post("/register-physician", async (req, res) => {
  await userRegister(req.body, "physician", res);
});
router.post("/login-Patient", async (req, res) => {
  await userLogin(req.body, res);
});

router.get(
  "/patient-protected",
  userAuth,
  checkRole(["patient"]),
  async (req, res) => {
    return res.json("Hello patient");
  }
);
router.get(
  "/physician-protected",
  userAuth,
  checkRole(["physician"]),
  async (req, res) => {
    return res.json("Hello physician");
  }
);

router.get(
  "/admin-protected",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello admin");
  }
);

router.get(
  "/physician-and-admin-protected",
  userAuth,
  checkRole(["admin", "physician"]),
  async (req, res) => {
    return res.json("Hello admin and physician");
  }
);

module.exports = router;
