const Review = require("../models/review.js");
const campgrounds = require("../models/campgrounds");

module.exports.createReview = async (req, res) => {
  const campground = await campgrounds.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Review posted!");

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await campgrounds.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully Deleted");
  res.redirect(`/campgrounds/${id}`);
};
