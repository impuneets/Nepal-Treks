if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const campgroundRoutes = require("./routes/campground.js");
const reviewRoutes = require("./routes/reviews.js");
const User = require("./models/user.js");
const userRoutes = require("./routes/user.js");
const { log } = require("console");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://127.0.0.1:27017/nepal-treks";
const MongoStore = require("connect-mongo");
const app = express();
// mongoose.connect("mongodb://localhost:27017/");
// "mongodb://127.0.0.1:27017/nepal-treks"

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});
// app.use(mongoSanitize);
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "secretKey",
  },
});
store.on("error", function (e) {
  console.log("Session Store Error", e);
});
const sessionConfig = {
  store: store,
  name: "trekCookie",
  secret: "secretKey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.returnTo = req.originalUrl;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "kkk@gamil.com", username: "abc" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong !";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Listening to port 3000");
});
