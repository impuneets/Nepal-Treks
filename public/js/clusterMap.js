// let a = JSON.parse(camps);
let markers = [];
camps.forEach((element) => {
  let latlng = {};
  latlng.lat = element.geometry.coordinates[0];
  latlng.lng = element.geometry.coordinates[1];
  markers.push(latlng);
});

const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const markersClusterGroup = L.markerClusterGroup();

markers.forEach((markerData) => {
  const marker = L.marker([markerData.lat, markerData.lng]);
  marker.bindPopup(`<b>Iilam</b><br>Most visited place`); // Move this line inside the loop
  markersClusterGroup.addLayer(marker); // Add the marker to the cluster group
});

map.addLayer(markersClusterGroup);
map.fitBounds(markersClusterGroup.getBounds());
markersClusterGroup.getLayers()[0].openPopup();
