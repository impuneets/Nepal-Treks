const campgrounds = require("../models/campgrounds");
const cloudinary = require("cloudinary").v2;
const geocode = process.env.OPENCAGE_API;
const geocodingEndpoint = "https://api.opencagedata.com/geocode/v1/json";
const axios = require("axios");

module.exports.index = async (req, res) => {
  const campground = await campgrounds.find({});
  res.render("campgrounds/index", { campground });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const location = req.body.campground.location;
  const response = await axios.get(geocodingEndpoint, {
    params: {
      key: geocode,
      q: location,
      limit: 2,
    },
  });
  const result = response.data.results[0];
  const setGeometry = { type: "Point" };
  const coordinates = [];
  if (result) {
    const { formatted, geometry } = result;
    const { lat, lng } = geometry;
    coordinates.push(lat);
    coordinates.push(lng);
    setGeometry.coordinates = coordinates;
  } else {
    req.flash("error", "Cant find that location");
    return res.redirect(`/campgrounds`);
  }
  const campground = new campgrounds(req.body.campground);
  campground.geometry = setGeometry;
  campground.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  let id = req.params.id;
  const campground = await campgrounds
    .findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cant find Campground");
    return res.redirect(`/campgrounds`);
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await campgrounds.findById(id);
  if (!campground) {
    req.flash("error", "Cant find Campground");
    return res.redirect(`/campgrounds`);
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;

  const camp = await campgrounds.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.image.push(...imgs);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
  }
  req.flash("success", "Successfully Updated");

  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await campgrounds.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "Permission required");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  await campgrounds.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campground");
  res.redirect("/campgrounds");
};
