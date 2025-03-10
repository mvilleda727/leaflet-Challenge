// Create the 'basemap' tile layer that will be the background of our map.
let myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
});

// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(function (data) {

  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth
      radius: getRadius(feature.properties.mag), // Magnitude
      color: "#000000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 1
    };
  }

  function getColor(depth) {
    return depth < 10 ? "#98ee00" :
           depth < 30 ? "#d4ee00" :
           depth < 50 ? "#eecc00" :
           depth < 70 ? "#ee9c00" :
           depth < 90 ? "#ea822c" : "#ea2c2c"; // Dark Red
  }

  function getRadius(magnitude) {
    return magnitude * 3; // Adjusted scale for uniqueness
  }

  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(myMap);

  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depthIntervals = [0, 10, 30, 50, 70, 90];
    const colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depthIntervals[i] + (depthIntervals[i + 1] ? '&ndash;' + depthIntervals[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    L.geoJson(plate_data, {
      color: "#ff6500",
      weight: 2
    }).addTo(myMap);
  });
});