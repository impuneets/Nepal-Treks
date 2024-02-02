let a = coordinates.split(",");
let mapOptions = {
  center: a,
  zoom: 12,
};
let map = L.map("map", mapOptions);
let layer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
layer.addTo(map);

let marker = L.marker(a).addTo(map);
marker.bindPopup(`<b>${loc}</b><br>This is the location of the campground.`).openPopup();
