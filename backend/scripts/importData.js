import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import * as shapefile from "shapefile";
import * as turf from "@turf/turf";
import Facility from "../src/models/Facility.model.js";
import CHW from "../src/models/CHW.model.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ------------------ Database Connection ------------------
async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

// ------------------ Import Facilities from shapefiles ------------------
async function importFacilities() {
  const shpPath = path.join(process.cwd(), "data", "facilities.shp");
  const dbfPath = path.join(process.cwd(), "data", "facilities.dbf");

  const facilities = [];
  console.log("📍 Reading shapefile...");

  try {
    const source = await shapefile.open(shpPath, dbfPath);
    let result;

    while (!(result = await source.read()).done) {
      const { geometry, properties } = result.value;
      if (!geometry || !geometry.coordinates) continue;

      // Normalize geometry
      const coords = Array.isArray(geometry.coordinates[0])
        ? geometry.coordinates[0]
        : geometry.coordinates;

      facilities.push({
        name:
          properties?.name_bn ||
          properties?.name_en ||
          properties?.name ||
          "Unnamed Facility",
        upazila: properties?.addr_city || properties?.upazila || "",
        geojson: { type: "Point", coordinates: coords },
        type: properties?.amenity || properties?.healthcare || "Other",
      });
    }

    await Facility.deleteMany({});
    const inserted = await Facility.insertMany(facilities);
    console.log(`🏥 ${inserted.length} facilities imported`);
    return inserted;
  } catch (error) {
    console.warn("⚠️ Shapefile not found or error reading shapefile:", error.message);
    console.log("🔄 Continuing with empty facilities list");
    return [];
  }
}

// ------------------ Import CHWs from Excel ------------------
async function importCHWs(excelPath, facilities) {
  console.log("📗 Reading CHW Excel file...");
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to JSON with range starting from row 1 (second row in Excel)
  const data = XLSX.utils.sheet_to_json(sheet, { 
    defval: "",
    range: 1  // Skip the first row (header with merged cells)
  });

  // Debug header detection
  console.log("🧾 Excel Headers:", Object.keys(data[0]));

  const chwRecords = [];

  for (const row of data) {
    // Extract fields directly from the Excel headers
    const facilityName = row["Facility"] || "";
    const chwName = row["Facility Head Name"] || "Unnamed";
    const designation = row["Designation"] || "";
    const division = row["Division"] || "";
    const district = row["District"] || "";
    
    // Handle contact numbers (might be comma-separated)
    const contactStr = row["Contact"] || "";
    const phones = contactStr ? contactStr.split(",").map(p => p.trim()) : [];
    
    const personalEmail = row["Personal Email"] || "";
    const officialEmail = row["Official Email"] || "";

    // Try to match facility by name
    let facilityDoc = null;
    if (facilityName && facilities.length > 0) {
      // First try exact match
      facilityDoc = facilities.find(f => 
        f.name?.trim() === facilityName?.trim()
      );
      
      // If no exact match, try partial match
      if (!facilityDoc) {
        facilityDoc = facilities.find(f => 
          f.name?.includes(facilityName?.trim()) || 
          facilityName?.trim().includes(f.name?.trim())
        );
      }
      
      // If still no match, try matching by upazila (district)
      if (!facilityDoc && district) {
        facilityDoc = facilities.find(f => 
          f.upazila?.toLowerCase() === district?.toLowerCase()
        );
      }
    }

    chwRecords.push({
      image: row["Image"] || "",
      name: chwName,
      designation,
      division,
      district,
      contact: {
        phone: phones,
        personalEmail,
        officialEmail,
      },
      facility: facilityDoc ? facilityDoc._id : null,
      location: facilityDoc
        ? { type: "Point", coordinates: facilityDoc.geojson.coordinates }
        : { type: "Point", coordinates: [0, 0] },
    });
  }

  console.log(`🔍 Parsed ${chwRecords.length} CHWs`);
  if (chwRecords.length > 0) {
    console.log("Example parsed CHW:", JSON.stringify(chwRecords[0], null, 2));
  }

  await CHW.deleteMany({});
  await CHW.insertMany(chwRecords);
  console.log(`👩‍⚕️ ${chwRecords.length} CHWs imported successfully`);
}

// ------------------ Main Runner ------------------
async function main() {
  try {
    await connectDB();
    const facilities = await importFacilities();
    const excelPath = path.join(process.cwd(), "data", "chws.xlsx");
    await importCHWs(excelPath, facilities);
    console.log("🎉 All data imported successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Import error:", err);
    process.exit(1);
  }
}

main();