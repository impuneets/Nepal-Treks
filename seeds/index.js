const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");
const Campground = require("../models/campgrounds");

mongoose.connect("mongodb://127.0.0.1:27017/nepal-treks");
const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1k = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "65b68ff722b9ce0dfe0cc985",
      location: `${cities[random1k].city + ", " + cities[random1k].state}`,
      title: `${sample(descriptors) + " " + sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium asperiores maxime libero iste temporibus fugiat cum? Cupiditate, dolorum a vero officiis minus rerum incidunt ipsam quaerat, aperiam repellendus exercitationem totam.",
      price,
      image: [
        {
          url: "https://res.cloudinary.com/dtqcdptog/image/upload/v1706639197/NepalCamps/afza6biqlxo8ljkm3yx9.png",
          filename: "NepalCamps/afza6biqlxo8ljkm3yx9",
        },
        {
          url: "https://res.cloudinary.com/dtqcdptog/image/upload/v1706639197/NepalCamps/afza6biqlxo8ljkm3yx9.png",
          filename: "NepalCamps/afza6biqlxo8ljkm3yx9",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  console.log("closed");
  mongoose.connection.close();
});
