const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { connect } = require("mongoose");
const { success, error } = require("consola");

//Bring in app constants
const { DB, PORT } = require("./config");

// Initialize the application
const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

require("./middlewares/passport")(passport);

//User Router middleWare
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profiles"));
app.use("/images", express.static("images"));

//inintialsze the applications
const startApp = async () => {
  try {
    //connections with DB
    await connect(DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    success({
      message: `Succesfully connected To Database\n${DB}`,
      badge: true,
    });
    //start listening to the port
    app.listen(process.env.PORT || PORT, () => {
      success({ message: `Listening on PORT  ${PORT}`, badge: true });
    });
  } catch (err) {
    error({ message: `Unable To connect with Database\n${err}`, badge: true });
    startApp();
  }
};
startApp();
