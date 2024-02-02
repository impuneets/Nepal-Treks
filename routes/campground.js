const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../controllers/campgrounds.js");
const { isLoggedIn, isAuthor, validateCampground, getCoordinates } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(Campground.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(Campground.createCampground)
  );

router.get("/new", isLoggedIn, Campground.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(Campground.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(Campground.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(Campground.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(Campground.renderEditForm));

module.exports = router;
