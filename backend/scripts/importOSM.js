// importOSM.js
import mongoose from "mongoose";
import axios from "axios";
import * as turf from "@turf/turf";
import Facility from "../src/models/Facility.model.js";
import CHW from "../src/models/CHW.model.js";
import UpazilaBoundary from "../src/models/UpazilaBoundary.model.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ------------------ Connect to MongoDB ------------------
async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

// ------------------ Fetch OSM facilities in bounding box ------------------
async function fetchOSMFacilities(bbox) {
  const query = `
    [out:json][timeout:50];
    (
      node["amenity"="hospital"](${bbox.join(",")});
      node["amenity"="clinic"](${bbox.join(",")});
      node["amenity"="doctors"](${bbox.join(",")});
      node["healthcare"](${bbox.join(",")});
    );
    out body;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url);
    return data.elements.map(el => ({
      osm_id: el.id,
      name: el.tags?.name || "Unnamed",
      type: el.tags?.amenity || el.tags?.healthcare || "Other",
      geojson: { type: "Point", coordinates: [el.lon, el.lat] }
    }));
  } catch (err) {
    console.warn("⚠️ Error fetching OSM facilities:", err.message);
    return [];
  }
}

// ------------------ Fetch OSM bus stops in bounding box ------------------
async function fetchOSMBusStops(bbox) {
  const query = `
    [out:json][timeout:50];
    node["highway"="bus_stop"](${bbox.join(",")});
    out body;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url);
    return data.elements.map(el => ({
      osm_id: el.id,
      name: el.tags?.name || "Bus Stop",
      geojson: { type: "Point", coordinates: [el.lon, el.lat] }
    }));
  } catch (err) {
    console.warn("⚠️ Error fetching bus stops:", err.message);
    return [];
  }
}

// ------------------ Calculate accessibility (bus within radius) ------------------
function enrichAccessibility(facilities, busStops, radiusMeters = 1000) {
  return facilities.map(fac => {
    const point = turf.point(fac.geojson.coordinates);
    const hasBus = busStops.some(bus => {
      const busPoint = turf.point(bus.geojson.coordinates);
      return turf.distance(point, busPoint, { units: "meters" }) <= radiusMeters;
    });
    return { ...fac, accessibility: { bus: hasBus } };
  });
}

// ------------------ Main import function ------------------
async function fetchOSMFacilities(bbox) {
  const query = `
    [out:json][timeout:100];
    (
      node["amenity"="hospital"](${bbox.join(",")});
      way["amenity"="hospital"](${bbox.join(",")});
      node["amenity"="clinic"](${bbox.join(",")});
      way["amenity"="clinic"](${bbox.join(",")});
      node["healthcare"](${bbox.join(",")});
      way["healthcare"](${bbox.join(",")});
    );
    out center;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url);

    return data.elements.map(el => ({
      osm_id: el.id,
      name: el.tags?.name || "Unnamed",
      type: el.tags?.amenity || el.tags?.healthcare || "Other",
      geojson: {
        type: "Point",
        coordinates: el.type === "node" ? [el.lon, el.lat] : [el.center.lon, el.center.lat]
      }
    }));
  } catch (err) {
    console.warn("⚠️ Error fetching OSM facilities:", err.message);
    return [];
  }
}


// ------------------ Run ------------------
async function main() {
  try {
    await connectDB();
    await importOSMFacilities();
    console.log("🎯 OSM import completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
