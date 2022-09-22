const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { SECRET } = require("../config/index");
//register user(admin,physician,patient)

const userRegister = async (userDetails, role, res) => {
  //validate user

  try {
    let emailNotRegistered = await validateEmail(userDetails.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: "Email already registered",
        success: false,
      });
    }

    //get the hashed passwords
    //12 round of salt
    const password = await bcrypt.hash(userDetails.password, 12);
    const newUser = new User({
      ...userDetails,
      password,
      role,
    });

    await newUser.save();
    return res.status(201).json({
      message: "You are successfully registered. Please login.",
      success: true,
    });
  } catch (err) {
    //Implement logger fuction (winston)
    return res.status(500).json({
      message: "Unable to create your account",
      success: false,
    });
  }
};

const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

const userLogin = async (userCreds, res) => {
  let { email, password } = userCreds;
  //first check if user is in the db
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "Email not found. Invalid login credentials.",
      success: false,
    });
  }

  let isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    //sign in the token and issue it to the user account
    let token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
        role: user.role,
        speciality: user.speciality,
        name: user.name,
        dob: user.dob,
        phone: user.phone,
      },
      SECRET,
      { expiresIn: "24h" }
    );

    let result = {
      name: user.name,
      dob: user.dob,
      phone: user.phone,
      speciality: user.speciality,
      email: user.email,
      role: user.role,
      token: `Bearer ${token}`,
      expiresIn: 168,
    };
    return res.status(200).json({
      ...result,
      message: "Succfully logged in.",
      success: true,
    });
  } else {
    return res.status(403).json({
      message: "Incorrect password.",
      success: false,
    });
  }
};

//passport middleware
const userAuth = passport.authenticate("jwt", { session: false });

//check user role
const checkRole = (roles) => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

module.exports = {
  userRegister,
  userLogin,
  userAuth,
  checkRole,
};
