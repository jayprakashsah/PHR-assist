const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route: Find nearby hospitals based on GPS coordinates
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required!" });
    }

    console.log(`🌍 Scanning for hospitals near: ${lat}, ${lng}`);

    // We use the Overpass API (OpenStreetMap) to find hospitals within a 5000m (5km) radius.
    // This is a real, live database query of the physical world!
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000, ${lat}, ${lng});
        way["amenity"="hospital"](around:5000, ${lat}, ${lng});
      );
      out center 5; // Get the top 5 closest results
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(overpassQuery)}`);

    // Clean up the raw data into a beautiful, easy-to-use format for our React app
    const hospitals = response.data.elements.map(place => {
      // Sometimes the API returns a 'node' (exact point) or a 'way' (a building outline)
      const placeLat = place.lat || place.center.lat;
      const placeLng = place.lon || place.center.lon;
      
      return {
        id: place.id,
        name: place.tags.name || "Unknown Hospital/Clinic",
        address: place.tags['addr:full'] || place.tags['addr:street'] || "Address not listed",
        phone: place.tags.phone || "No phone listed",
        emergency: place.tags.emergency === 'yes' ? true : false,
        lat: placeLat,
        lng: placeLng
      };
    });

    res.status(200).json({ 
      message: "Hospitals located successfully", 
      count: hospitals.length,
      data: hospitals 
    });

  } catch (error) {
    console.error("Geospatial Error:", error.message);
    res.status(500).json({ message: "Failed to scan nearby area", error: error.message });
  }
});

module.exports = router;