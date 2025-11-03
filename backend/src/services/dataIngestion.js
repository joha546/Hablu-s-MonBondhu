// backend/src/services/dataIngestion.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { gunzip } from 'zlib';
import { promisify } from 'util';
import { load } from 'cheerio';
import HealthFacility from '../models/HealthFacility.js';
import HealthWorker from '../models/HealthWorker.js';
import { logger } from '../utils/logger.js';

const gunzipAsync = promisify(gunzip);

class DataIngestionService {
  constructor() {
    // Data source URLs
    this.hdxHealthFacilitiesUrl = 'https://data.humdata.org/dataset/hotosm_bgd_health_facilities';
    this.overpassApiUrl = 'https://overpass-api.de/api/interpreter';
    this.upazilaBoundariesUrl = 'https://github.com/nuhil/bangladesh-geocode/raw/master/geojson/upazilas.geojson';
    this.dghsFacilitiesUrl = 'https://old.dghs.gov.bd/dghs_website/facilityHeadContactInformation.php';
    
    // Alternative data sources
    this.alternativeDataSources = {
      hdx: 'https://data.humdata.org/api/3/action/package_show?id=hotosm_bgd_health_facilities',
      geonames: 'http://download.geonames.org/export/dump/BD.zip',
      healthsites: 'https://healthsites.io/api/v2/facilities.json?country=BD',
      osmAlternative: 'https://lz4.overpass-api.de/api/interpreter',
      upazilaBoundaries: [
        'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/geojson/upazilas.geojson',
        'https://raw.githubusercontent.com/mahfuzmd/BD-GeoJSON-Data/master/Upazila/Upazila_GeoJSON.json',
        'https://raw.githubusercontent.com/shakib-hasan/bangladesh-geojson/master/bangladesh-geojson-master/bd-upazila.json'
      ]
    };
    
    // Cache directory for downloaded data
    this.cacheDir = './data_cache';
  }

  async initialize() {
    // Create cache directory if it doesn't exist
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      logger.info('Data ingestion service initialized');
    } catch (error) {
      logger.error('Failed to initialize data ingestion service:', error);
      throw error;
    }
  }

  async ingestHDXData() {
    try {
      logger.info('Starting HDX health facilities data ingestion');
      
      let csvUrl = null;
      let facilities = [];
      
      // Method 1: Try to find the download URL dynamically
      try {
        logger.info('Attempting to find HDX download URL dynamically...');
        const hdxPageResponse = await fetch(this.hdxHealthFacilitiesUrl);
        
        if (hdxPageResponse.ok) {
          const hdxHtml = await hdxPageResponse.text();
          const $ = load(hdxHtml);
          
          // Look for CSV download links
          $('a[href*=".csv"]').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('download')) {
              csvUrl = href.startsWith('http') ? href : `https://data.humdata.org${href}`;
              return false; // Exit the loop after finding the first match
            }
          });
          
          // If still not found, try the HDX API
          if (!csvUrl) {
            logger.info('Trying HDX API to find download URL...');
            const apiResponse = await fetch(this.alternativeDataSources.hdx);
            if (apiResponse.ok) {
              const apiData = await apiResponse.json();
              if (apiData.result && apiData.result.resources) {
                const csvResource = apiData.result.resources.find(resource => 
                  resource.format.toLowerCase() === 'csv' || resource.url.includes('.csv')
                );
                if (csvResource) {
                  csvUrl = csvResource.url;
                }
              }
            }
          }
        }
      } catch (error) {
        logger.warn('Failed to find HDX URL dynamically:', error.message);
      }
      
      // Method 2: Try to download from the found URL
      if (csvUrl) {
        try {
          logger.info(`Downloading HDX data from: ${csvUrl}`);
          const csvResponse = await fetch(csvUrl);
          
          if (csvResponse.ok) {
            const csvBuffer = await csvResponse.buffer();
            
            // Check if the file is gzipped and extract if needed
            let csvData;
            if (csvUrl.endsWith('.gz')) {
              csvData = await gunzipAsync(csvBuffer);
            } else {
              csvData = csvBuffer;
            }
            
            // Parse the CSV data
            const records = parse(csvData.toString(), {
              columns: true,
              skip_empty_lines: true
            });
            
            logger.info(`Parsed ${records.length} records from HDX data`);
            
            // Transform the data
            facilities = records.map(record => {
              const name = record.name || record.facility_name || record.osm_name || 'Unknown Facility';
              const latitude = parseFloat(record.lat || record.latitude || record.osm_lat);
              const longitude = parseFloat(record.lon || record.longitude || record.osm_lon);
              
              if (isNaN(latitude) || isNaN(longitude)) {
                return null;
              }
              
              return {
                name: name,
                type: this.mapFacilityType(record.amenity || record.facility_type || record.healthcare),
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                },
                address: record.addr_full || record.address || 'Unknown Address',
                upazila: record.addr_subdistrict || record.upazila || 'Unknown',
                district: record.addr_district || record.district || 'Unknown',
                division: record.addr_state || record.division || 'Unknown',
                services: this.parseServices(record.healthcare || record.services),
                contact: {
                  phone: record.phone || record.contact_phone,
                  email: record.email || record.contact_email
                },
                operatingHours: record.opening_hours || 'Unknown',
                accessibility: {
                  roadAccess: true,
                  publicTransport: record.public_transport === 'yes',
                  transportOptions: this.parseTransportOptions(record.transport || ''),
                  accessibilityNotes: record.accessibility || ''
                },
                verified: false,
                lastUpdated: new Date(),
                source: 'HDX'
              };
            }).filter(facility => facility !== null);
          }
        } catch (error) {
          logger.warn('Failed to download HDX data:', error.message);
        }
      }
      
      // Method 3: Fallback to alternative data sources
      if (facilities.length === 0) {
        logger.info('Trying alternative data sources...');
        
        // Try Healthsites.io
        try {
          logger.info('Fetching data from Healthsites.io...');
          const healthsitesResponse = await fetch(this.alternativeDataSources.healthsites);
          
          if (healthsitesResponse.ok) {
            const healthsitesData = await healthsitesResponse.json();
            
            if (healthsitesData.features) {
              facilities = healthsitesData.features.map(feature => {
                const [longitude, latitude] = feature.geometry.coordinates;
                const properties = feature.properties;
                
                return {
                  name: properties.name || 'Unknown Facility',
                  type: this.mapFacilityType(properties.amenity || properties.category),
                  location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                  },
                  address: properties.addr_full || properties.address || 'Unknown Address',
                  upazila: properties.suburb || 'Unknown',
                  district: properties.city || properties.county || 'Unknown',
                  division: properties.state || 'Unknown',
                  services: this.parseServices(properties.healthcare || properties.specialities),
                  contact: {
                    phone: properties.phone,
                    email: properties.email
                  },
                  operatingHours: properties.opening_hours || 'Unknown',
                  accessibility: {
                    roadAccess: true,
                    publicTransport: properties.public_transport === 'yes',
                    transportOptions: this.parseTransportOptions(properties.transport || ''),
                    accessibilityNotes: properties.accessibility || ''
                  },
                  verified: false,
                  lastUpdated: new Date(),
                  source: 'Healthsites.io'
                };
              });
              
              logger.info(`Found ${facilities.length} facilities from Healthsites.io`);
            }
          }
        } catch (error) {
          logger.warn('Failed to fetch data from Healthsites.io:', error.message);
        }
      }
      
      // Method 4: Last resort - use sample data
      if (facilities.length === 0) {
        logger.warn('All data sources failed, using sample data...');
        facilities = this.getSampleHealthFacilities();
      }
      
      // Save to database
      if (facilities.length > 0) {
        await HealthFacility.insertMany(facilities, { ordered: false });
        logger.info(`Successfully ingested ${facilities.length} health facilities`);
      } else {
        logger.error('No facilities data could be ingested');
      }
      
      return facilities.length;
    } catch (error) {
      logger.error('Error ingesting HDX data:', error);
      throw error;
    }
  }
  
  async ingestOSMData() {
    try {
      logger.info('Starting OpenStreetMap data ingestion');
      
      let facilities = [];
      
      // Method 1: Try the primary Overpass API
      try {
        logger.info('Fetching data from primary Overpass API...');
        facilities = await this.fetchFromOverpassAPI(this.overpassApiUrl);
      } catch (error) {
        logger.warn('Failed to fetch from primary Overpass API:', error.message);
        
        // Method 2: Try alternative Overpass API
        try {
          logger.info('Trying alternative Overpass API...');
          facilities = await this.fetchFromOverpassAPI(this.alternativeDataSources.osmAlternative);
        } catch (error) {
          logger.warn('Failed to fetch from alternative Overpass API:', error.message);
          
          // Method 3: Use a smaller query to avoid timeouts
          try {
            logger.info('Trying smaller query to avoid timeouts...');
            facilities = await this.fetchFromOverpassAPIWithSmallerQuery();
          } catch (error) {
            logger.warn('Failed with smaller query:', error.message);
            
            // Method 4: Last resort - use sample OSM data
            logger.warn('All OSM data sources failed, using sample data...');
            facilities = this.getSampleOSMFacilities();
          }
        }
      }
      
      // Save to database
      if (facilities.length > 0) {
        await HealthFacility.insertMany(facilities, { ordered: false });
        logger.info(`Successfully ingested ${facilities.length} health facilities from OSM`);
      } else {
        logger.warn('No valid facilities found in OSM data');
      }
      
      return facilities.length;
    } catch (error) {
      logger.error('Error ingesting OSM data:', error);
      throw error;
    }
  }
  
  async fetchFromOverpassAPI(apiUrl) {
    // Use Overpass API to get healthcare facilities in Bangladesh
    const overpassQuery = `
      [out:json][timeout:180];
      (
        node["amenity"~"hospital|clinic|doctors|pharmacy"](88.0,20.5,92.5,26.5);
        way["amenity"~"hospital|clinic|doctors|pharmacy"](88.0,20.5,92.5,26.5);
        relation["amenity"~"hospital|clinic|doctors|pharmacy"](88.0,20.5,92.5,26.5);
      );
      out geom;
    `;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OSM data: ${response.status} ${response.statusText}`);
    }
    
    const osmData = await response.json();
    return this.processOSMData(osmData);
  }
  
  async fetchFromOverpassAPIWithSmallerQuery() {
    // Use a smaller query to avoid timeouts
    const overpassQuery = `
      [out:json][timeout:60];
      (
        node["amenity"="hospital"](88.0,20.5,92.5,26.5);
      );
      out geom;
    `;
    
    const response = await fetch(this.overpassApiUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OSM data with smaller query: ${response.status} ${response.statusText}`);
    }
    
    const osmData = await response.json();
    return this.processOSMData(osmData);
  }
  
  processOSMData(osmData) {
    // Process the OSM data
    const facilities = [];
    
    if (osmData.elements) {
      osmData.elements.forEach(element => {
        let coordinates = null;
        
        if (element.type === 'node' && element.lat && element.lon) {
          coordinates = [element.lon, element.lat];
        } else if (element.type === 'way' && element.geometry && element.geometry.length > 0) {
          // For ways, use the first coordinate as a representative point
          coordinates = [element.geometry[0].lon, element.geometry[0].lat];
        } else if (element.type === 'relation' && element.center) {
          coordinates = [element.center.lon, element.center.lat];
        }
        
        if (coordinates && element.tags) {
          facilities.push({
            id: element.id.toString(),
            lat: coordinates[1].toString(),
            lon: coordinates[0].toString(),
            tags: element.tags
          });
        }
      });
    }
    
    logger.info(`Found ${facilities.length} healthcare facilities in OSM data`);
    
    // Transform and save to database
    return facilities.map(node => {
      const tags = node.tags || {};
      
      return {
        name: tags.name || 'Unknown Facility',
        type: this.mapFacilityType(tags.amenity),
        location: {
          type: 'Point',
          coordinates: [parseFloat(node.lon), parseFloat(node.lat)]
        },
        address: tags['addr:full'] || tags['addr:housename'] || 'Unknown Address',
        upazila: tags['addr:subdistrict'] || 'Unknown',
        district: tags['addr:district'] || 'Unknown',
        division: tags['addr:state'] || 'Unknown',
        services: this.parseServices(tags.healthcare),
        contact: {
          phone: tags.phone,
          email: tags.email
        },
        operatingHours: tags.opening_hours || 'Unknown',
        accessibility: {
          roadAccess: true,
          publicTransport: tags.public_transport === 'yes',
          transportOptions: this.parseTransportOptions(tags.transport || ''),
          accessibilityNotes: tags.accessibility || ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'OSM'
      };
    });
  }
  
  async ingestUpazilaBoundaries() {
    try {
      logger.info('Starting upazila boundaries data ingestion');
      
      let geoJsonData = null;
      let success = false;
      
      // Method 1: Try the primary URL
      try {
        logger.info(`Downloading upazila boundaries from: ${this.upazilaBoundariesUrl}`);
        const response = await fetch(this.upazilaBoundariesUrl);
        
        if (response.ok) {
          geoJsonData = await response.json();
          success = true;
        }
      } catch (error) {
        logger.warn('Failed to download upazila boundaries from primary URL:', error.message);
      }
      
      // Method 2: Try alternative URLs
      if (!success) {
        for (const url of this.alternativeDataSources.upazilaBoundaries) {
          try {
            logger.info(`Trying alternative upazila boundaries URL: ${url}`);
            const response = await fetch(url);
            
            if (response.ok) {
              geoJsonData = await response.json();
              success = true;
              break;
            }
          } catch (error) {
            logger.warn(`Failed to download from ${url}:`, error.message);
          }
        }
      }
      
      // Method 3: Use sample data if all else fails
      if (!success) {
        logger.warn('All upazila boundaries sources failed, using sample data...');
        geoJsonData = this.getSampleUpazilaBoundaries();
      }
      
      // Save to cache
      const geoJsonPath = `${this.cacheDir}/upazila_boundaries.geojson`;
      await fs.writeFile(geoJsonPath, JSON.stringify(geoJsonData, null, 2));
      
      // Process each upazila boundary
      const upazilas = geoJsonData.features.map(feature => {
        return {
          name: feature.properties.NAME_3 || feature.properties.name || feature.properties.Upazila || 'Unknown Upazila',
          district: feature.properties.NAME_2 || feature.properties.district || feature.properties.District || 'Unknown District',
          division: feature.properties.NAME_1 || feature.properties.division || feature.properties.Division || 'Unknown Division',
          geometry: feature.geometry,
          properties: feature.properties
        };
      });
      
      logger.info(`Successfully processed ${upazilas.length} upazila boundaries`);
      
      return upazilas.length;
    } catch (error) {
      logger.error('Error ingesting upazila boundaries:', error);
      throw error;
    }
  }
  
  getSampleUpazilaBoundaries() {
    return {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "NAME_1": "Dhaka Division",
            "NAME_2": "Dhaka District",
            "NAME_3": "Savar Upazila"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [90.20, 23.80],
              [90.30, 23.80],
              [90.30, 23.90],
              [90.20, 23.90],
              [90.20, 23.80]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "NAME_1": "Dhaka Division",
            "NAME_2": "Dhaka District",
            "NAME_3": "Mirpur Upazila"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [90.30, 23.70],
              [90.40, 23.70],
              [90.40, 23.80],
              [90.30, 23.80],
              [90.30, 23.70]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "NAME_1": "Chittagong Division",
            "NAME_2": "Chittagong District",
            "NAME_3": "Sitakunda Upazila"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [91.60, 22.50],
              [91.70, 22.50],
              [91.70, 22.60],
              [91.60, 22.60],
              [91.60, 22.50]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "NAME_1": "Khulna Division",
            "NAME_2": "Khulna District",
            "NAME_3": "Dumuria Upazila"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [89.40, 22.80],
              [89.50, 22.80],
              [89.50, 22.90],
              [89.40, 22.90],
              [89.40, 22.80]
            ]]
          }
        }
      ]
    };
  }
  
  getSampleOSMFacilities() {
    return [
      {
        name: 'Bangabandhu Sheikh Mujib Medical University',
        type: 'hospital',
        location: {
          type: 'Point',
          coordinates: [90.4125, 23.8103]
        },
        address: 'Shahbagh, Dhaka',
        upazila: 'Shahbagh',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Emergency care', 'Surgery', 'Maternity care'],
        contact: {
          phone: '+880-2-9661051',
          email: null
        },
        operatingHours: '24/7',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['bus', 'rickshaw', 'auto_rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'OSM Sample'
      },
      {
        name: 'Ibrahim Medical College Hospital',
        type: 'clinic',
        location: {
          type: 'Point',
          coordinates: [90.3760, 23.7465]
        },
        address: 'Abul Hasnat, Dhaka',
        upazila: 'Dhanmondi',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Primary care', 'Specialist care'],
        contact: {
          phone: '+880-2-58615162',
          email: null
        },
        operatingHours: '08:00-22:00',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['bus', 'rickshaw', 'auto_rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'OSM Sample'
      },
      {
        name: 'Dr. Mia\'s Clinic',
        type: 'clinic',
        location: {
          type: 'Point',
          coordinates: [90.4087, 23.7925]
        },
        address: 'Dhanmondi, Dhaka',
        upazila: 'Dhanmondi',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['General practice'],
        contact: {
          phone: '+880-2-8616662',
          email: null
        },
        operatingHours: '09:00-20:00',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['rickshaw', 'auto_rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'OSM Sample'
      }
    ];
  }
  
  getSampleHealthFacilities() {
    return [
      {
        name: 'Dhaka Medical College Hospital',
        type: 'hospital',
        location: {
          type: 'Point',
          coordinates: [90.4087, 23.7329]
        },
        address: 'Shahbagh, Dhaka',
        upazila: 'Shahbagh',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Emergency care', 'Surgery', 'Maternity care'],
        contact: {
          phone: '+880-2-8616661',
          email: null
        },
        operatingHours: '24/7',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['bus', 'rickshaw', 'auto_rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'Sample'
      },
      {
        name: 'Kurmitola General Hospital',
        type: 'hospital',
        location: {
          type: 'Point',
          coordinates: [90.3948, 23.8251]
        },
        address: 'Kurmitola, Dhaka',
        upazila: 'Kurmitola',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Emergency care', 'Surgery', 'Maternity care'],
        contact: {
          phone: '+880-2-55045312',
          email: null
        },
        operatingHours: '24/7',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['bus', 'rickshaw', 'auto_rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'Sample'
      },
      {
        name: 'Savar Upazila Health Complex',
        type: 'upazila_health_complex',
        location: {
          type: 'Point',
          coordinates: [90.2667, 23.8583]
        },
        address: 'Savar, Dhaka',
        upazila: 'Savar',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Primary care', 'Maternity care', 'Child health'],
        contact: {
          phone: '+880-2-7744752',
          email: null
        },
        operatingHours: '08:00-20:00',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['bus', 'rickshaw'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'Sample'
      },
      {
        name: 'Mirpur Model Union Health Center',
        type: 'union_health_center',
        location: {
          type: 'Point',
          coordinates: [90.3628, 23.8223]
        },
        address: 'Mirpur, Dhaka',
        upazila: 'Mirpur',
        district: 'Dhaka',
        division: 'Dhaka Division',
        services: ['Primary care', 'Vaccination', 'Maternity care'],
        contact: {
          phone: '+880-2-8012986',
          email: null
        },
        operatingHours: '08:00-16:00',
        accessibility: {
          roadAccess: true,
          publicTransport: true,
          transportOptions: ['rickshaw', 'van'],
          accessibilityNotes: ''
        },
        verified: false,
        lastUpdated: new Date(),
        source: 'Sample'
      }
    ];
  }
  
  async ingestCHWData() {
    try {
      logger.info('Starting community health worker data ingestion');
      
      // Fetch data from DGHS website
      logger.info(`Fetching CHW data from: ${this.dghsFacilitiesUrl}`);
      const response = await fetch(this.dghsFacilitiesUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch DGHS data: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML to extract facility and contact information
      const $ = load(html);
      
      // Extract data from HTML tables
      const chwData = [];
      
      // Look for tables containing facility information
      $('table').each((tableIndex, tableElement) => {
        const rows = $(tableElement).find('tr');
        
        rows.each((rowIndex, rowElement) => {
          const cells = $(rowElement).find('td, th');
          
          if (cells.length >= 3) {
            const name = $(cells[0]).text().trim();
            const designation = $(cells[1]).text().trim();
            const contact = $(cells[2]).text().trim();
            const facility = $(cells[3]).text().trim();
            
            // Only process rows with actual data
            if (name && contact && !name.toLowerCase().includes('name') && !name.toLowerCase().includes('পদবী')) {
              // Extract phone number from contact string
              const phoneMatch = contact.match(/(\+?880?1[3-9]\d{8}|01[3-9]\d{8})/);
              const phone = phoneMatch ? phoneMatch[0] : contact;
              
              // Geocode the facility location
              const coordinates = this.geocodeLocation(facility);
              
              chwData.push({
                name: name,
                type: this.mapWorkerType(designation),
                location: {
                  type: 'Point',
                  coordinates: coordinates
                },
                serviceArea: {
                  type: 'Polygon',
                  coordinates: [[
                    [coordinates[0] - 0.01, coordinates[1] - 0.01],
                    [coordinates[0] + 0.01, coordinates[1] - 0.01],
                    [coordinates[0] + 0.01, coordinates[1] + 0.01],
                    [coordinates[0] - 0.01, coordinates[1] + 0.01],
                    [coordinates[0] - 0.01, coordinates[1] - 0.01]
                  ]]
                },
                contact: {
                  phone: phone,
                  whatsapp: phone
                },
                skills: this.inferSkillsFromDesignation(designation),
                availability: 'full_time',
                organization: 'DGHS',
                verified: true,
                languages: ['Bangla'],
                lastUpdated: new Date(),
                source: 'DGHS',
                facility: facility
              });
            }
          }
        });
      });
      
      // If no data found, use sample CHW data
      if (chwData.length === 0) {
        logger.warn('No CHW data found from DGHS, using sample data...');
        chwData.push(...this.getSampleCHWData());
      }
      
      // Save to database
      if (chwData.length > 0) {
        await HealthWorker.insertMany(chwData, { ordered: false });
        logger.info(`Successfully ingested ${chwData.length} community health workers`);
      } else {
        logger.warn('No valid CHW data found');
      }
      
      return chwData.length;
    } catch (error) {
      logger.error('Error ingesting CHW data:', error);
      throw error;
    }
  }
  
  getSampleCHWData() {
    return [
      {
        name: 'মোঃ আব্দুল করিম',
        type: 'CHW',
        location: {
          type: 'Point',
          coordinates: [90.4125, 23.8103]
        },
        serviceArea: {
          type: 'Polygon',
          coordinates: [[
            [90.4, 23.8],
            [90.42, 23.8],
            [90.42, 23.82],
            [90.4, 23.82],
            [90.4, 23.8]
          ]]
        },
        contact: {
          phone: '+8801712345678',
          whatsapp: '+8801712345678'
        },
        skills: ['Maternal health', 'Child health', 'Basic first aid'],
        availability: 'full_time',
        organization: 'DGHS',
        verified: true,
        languages: ['Bangla', 'English'],
        lastUpdated: new Date(),
        source: 'Sample'
      },
      {
        name: 'ফাতেমা বেগম',
        type: 'CHW',
        location: {
          type: 'Point',
          coordinates: [89.5403, 22.8077]
        },
        serviceArea: {
          type: 'Polygon',
          coordinates: [[
            [89.53, 22.8],
            [89.55, 22.8],
            [89.55, 22.81],
            [89.53, 22.81],
            [89.53, 22.8]
          ]]
        },
        contact: {
          phone: '+8801812345678',
          whatsapp: '+8801812345678'
        },
        skills: ['Maternal health', 'Child health', 'Vaccination support'],
        availability: 'part_time',
        organization: 'BRAC',
        verified: true,
        languages: ['Bangla'],
        lastUpdated: new Date(),
        source: 'Sample'
      }
    ];
  }
  
  async standardizeLocationData() {
    try {
      logger.info('Starting location data standardization');
      
      // Get all facilities
      const facilities = await HealthFacility.find({});
      
      // Standardize each facility
      const standardizedFacilities = facilities.map(facility => {
        const [lng, lat] = facility.location.coordinates;
        
        const roundedCoordinates = [
          Math.round(lng * 1000000) / 1000000,
          Math.round(lat * 1000000) / 1000000
        ];
        
        const standardizedType = this.mapFacilityType(facility.type);
        const standardizedAddress = this.standardizeAddress(facility.address);
        const accessibility = this.determineAccessibility(
          facility.location.coordinates,
          facility.type,
          facility.accessibility
        );
        
        return {
          ...facility.toObject(),
          location: {
            type: 'Point',
            coordinates: roundedCoordinates
          },
          type: standardizedType,
          address: standardizedAddress,
          accessibility,
          lastUpdated: new Date()
        };
      });
      
      // Update facilities in database
      const updatePromises = standardizedFacilities.map(facility => 
        HealthFacility.findByIdAndUpdate(facility._id, facility, { new: true })
      );
      
      await Promise.all(updatePromises);
      logger.info(`Successfully standardized ${standardizedFacilities.length} facility records`);
      
      return standardizedFacilities.length;
    } catch (error) {
      logger.error('Error standardizing location data:', error);
      throw error;
    }
  }
  
  // Helper methods (unchanged from previous implementation)
  mapFacilityType(type) {
    const typeMap = {
      'hospital': 'hospital',
      'clinic': 'clinic',
      'doctors': 'clinic',
      'pharmacy': 'clinic',
      'community_clinic': 'community_clinic',
      'upazila_health_complex': 'upazila_health_complex',
      'union_health_center': 'union_health_center',
      'medical_centre': 'clinic',
      'health_post': 'community_clinic',
      'doctors': 'clinic'
    };
    
    return typeMap[type] || 'clinic';
  }
  
  mapWorkerType(designation) {
    const designationLower = designation.toLowerCase();
    
    if (designationLower.includes('community health worker') || designationLower.includes('chw')) {
      return 'CHW';
    } else if (designationLower.includes('doctor') || designationLower.includes('dr')) {
      return 'doctor';
    } else if (designationLower.includes('nurse')) {
      return 'nurse';
    } else if (designationLower.includes('midwife')) {
      return 'midwife';
    } else {
      return 'volunteer';
    }
  }
  
  inferSkillsFromDesignation(designation) {
    const designationLower = designation.toLowerCase();
    const skills = [];
    
    if (designationLower.includes('maternal') || designationLower.includes('pregnancy')) {
      skills.push('Maternal health');
    }
    if (designationLower.includes('child') || designationLower.includes('pediatric')) {
      skills.push('Child health');
    }
    if (designationLower.includes('vaccin')) {
      skills.push('Vaccination support');
    }
    if (designationLower.includes('first aid')) {
      skills.push('Basic first aid');
    }
    
    if (skills.length === 0) {
      skills.push('Basic health support');
    }
    
    return skills;
  }
  
  geocodeLocation(locationString) {
    const locationLower = locationString.toLowerCase();
    
    const cityCoordinates = {
      'dhaka': [90.4125, 23.8103],
      'chittagong': [91.7832, 22.3569],
      'khulna': [89.5403, 22.8077],
      'rajshahi': [88.5974, 24.3636],
      'sylhet': [91.8833, 24.8949],
      'barisal': [90.3696, 22.7010],
      'rangpur': [89.2444, 25.7439],
      'mymensingh': [90.4203, 24.7471]
    };
    
    for (const [city, coordinates] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        return coordinates;
      }
    }
    
    return [90.4125, 23.8103];
  }
  
  parseServices(servicesString) {
    if (!servicesString) return [];
    return servicesString.split(';').map(service => service.trim()).filter(service => service);
  }
  
  parseTransportOptions(transportString) {
    if (!transportString) return [];
    
    const commonOptions = ['bus', 'rickshaw', 'van', 'boat', 'train', 'auto_rickshaw'];
    return commonOptions.filter(option => 
      transportString.toLowerCase().includes(option)
    );
  }
  
  standardizeAddress(address) {
    if (!address) return 'Unknown Address';
    return address.replace(/\s+/g, ' ').trim();
  }
  
  determineAccessibility(coordinates, facilityType, currentAccessibility) {
    let roadAccess = true;
    let publicTransport = false;
    let transportOptions = [];
    
    switch (facilityType) {
      case 'hospital':
        publicTransport = true;
        transportOptions = ['bus', 'rickshaw', 'auto_rickshaw'];
        break;
      case 'upazila_health_complex':
        publicTransport = true;
        transportOptions = ['bus', 'rickshaw'];
        break;
      case 'union_health_center':
        publicTransport = true;
        transportOptions = ['rickshaw', 'van'];
        break;
      case 'community_clinic':
        publicTransport = false;
        transportOptions = ['rickshaw', 'van', 'walking'];
        break;
      default:
        transportOptions = ['rickshaw'];
    }
    
    if (currentAccessibility) {
      roadAccess = currentAccessibility.roadAccess !== undefined ? currentAccessibility.roadAccess : roadAccess;
      publicTransport = currentAccessibility.publicTransport !== undefined ? currentAccessibility.publicTransport : publicTransport;
      transportOptions = currentAccessibility.transportOptions && currentAccessibility.transportOptions.length > 0 
        ? currentAccessibility.transportOptions 
        : transportOptions;
    }
    
    return {
      roadAccess,
      publicTransport,
      transportOptions,
      accessibilityNotes: currentAccessibility.accessibilityNotes || ''
    };
  }
  
  async runFullIngestion() {
    try {
      await this.initialize();
      
      const results = {
        hdx: await this.ingestHDXData(),
        osm: await this.ingestOSMData(),
        upazila: await this.ingestUpazilaBoundaries(),
        chw: await this.ingestCHWData(),
        standardized: await this.standardizeLocationData()
      };
      
      logger.info('Data ingestion completed:', results);
      return results;
    } catch (error) {
      logger.error('Error during full data ingestion:', error);
      throw error;
    }
  }
}

export default new DataIngestionService();