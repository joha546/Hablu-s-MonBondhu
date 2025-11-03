// client/src/services/mapService.js
import L from 'leaflet';
import Dexie from 'dexie';

class MapService {
  constructor() {
    this.db = new Dexie('HealthMapDB');
    this.db.version(1).stores({
      facilities: '++id, name, type, location, upazila, district, cachedAt',
      mapTiles: 'url, data, cachedAt'
    });
    
    this.map = null;
    this.userLocation = null;
  }
  
  async initializeMap(containerId) {
    // Initialize Leaflet map
    this.map = L.map(containerId).setView([23.71, 90.35], 7);
    
    // Add tile layer with offline support
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    });
    
    tileLayer.addTo(this.map);
    
    // Cache tiles for offline use
    this.cacheMapTiles();
    
    // Get user location
    this.getUserLocation();
    
    // Load facilities (from cache if offline)
    await this.loadFacilities();
  }
  
  async getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.longitude, position.coords.latitude];
          this.map.setView([position.coords.latitude, position.coords.longitude], 12);
          
          // Add user location marker
          L.marker([position.coords.latitude, position.coords.longitude])
            .addTo(this.map)
            .bindPopup('আপনার অবস্থান');
          
          // Find and show nearest facilities
          this.findNearestFacilities();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location or ask user to input
        }
      );
    }
  }
  
  async loadFacilities() {
    try {
      // Try to get facilities from server
      const response = await fetch('/api/healthmap/facilities');
      if (response.ok) {
        const facilities = await response.json();
        
        // Cache facilities locally
        await this.cacheFacilities(facilities);
        
        // Display facilities on map
        this.displayFacilities(facilities);
      }
    } catch (error) {
      console.error('Error loading facilities from server:', error);
      
      // Load from cache if offline
      const cachedFacilities = await this.getCachedFacilities();
      if (cachedFacilities.length > 0) {
        this.displayFacilities(cachedFacilities);
      }
    }
  }
  
  async cacheFacilities(facilities) {
    const transaction = this.db.transaction('rw', this.db.facilities);
    await this.db.facilities.clear();
    await this.db.facilities.bulkAdd(
      facilities.map(f => ({ ...f, cachedAt: new Date() }))
    );
    await transaction.complete();
  }
  
  async getCachedFacilities() {
    return await this.db.facilities.toArray();
  }
  
  displayFacilities(facilities) {
    facilities.forEach(facility => {
      const [lng, lat] = facility.location.coordinates;
      
      // Create custom icon based on facility type
      const icon = this.getFacilityIcon(facility.type);
      
      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map)
        .bindPopup(this.createFacilityPopup(facility));
    });
  }
  
  getFacilityIcon(type) {
    // Return different icons based on facility type
    const iconUrls = {
      hospital: '/icons/hospital.png',
      clinic: '/icons/clinic.png',
      community_clinic: '/icons/community-clinic.png',
      upazila_health_complex: '/icons/upazila-health.png',
      union_health_center: '/icons/union-health.png'
    };
    
    return L.icon({
      iconUrl: iconUrls[type] || '/icons/health-facility.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  }
  
  createFacilityPopup(facility) {
    // Create simple, accessible popup content in Bangla
    return `
      <div class="facility-popup">
        <h3>${facility.name}</h3>
        <p><strong>ধরন:</strong> ${this.translateFacilityType(facility.type)}</p>
        <p><strong>ঠিকানা:</strong> ${facility.address}</p>
        <p><strong>উপজেলা:</strong> ${facility.upazila}</p>
        <p><strong>যোগাযোগ:</strong> ${facility.contact.phone || 'N/A'}</p>
        ${facility.accessibility.publicTransport ? 
          '<p><strong>গণপরিবহন:</strong> হ্যাঁ</p>' : 
          '<p><strong>গণপরিবহন:</strong> না</p>'
        }
        <button class="btn-directions" data-lng="${facility.location.coordinates[0]}" data-lat="${facility.location.coordinates[1]}">
          দিকনির্দেশ দেখুন
        </button>
      </div>
    `;
  }
  
  translateFacilityType(type) {
    const translations = {
      hospital: 'হাসপাতাল',
      clinic: 'ক্লিনিক',
      community_clinic: 'কমিউনিটি ক্লিনিক',
      upazila_health_complex: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
      union_health_center: 'ইউনিয়ন স্বাস্থ্য কেন্দ্র'
    };
    
    return translations[type] || type;
  }
  
  async findNearestFacilities() {
    if (!this.userLocation) return;
    
    try {
      const response = await fetch('/api/healthmap/nearest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          location: this.userLocation,
          limit: 5
        })
      });
      
      if (response.ok) {
        const facilities = await response.json();
        this.displayNearestFacilities(facilities);
      }
    } catch (error) {
      console.error('Error finding nearest facilities:', error);
    }
  }
  
  displayNearestFacilities(facilities) {
    // Clear existing nearest facilities markers
    if (this.nearestMarkersGroup) {
      this.map.removeLayer(this.nearestMarkersGroup);
    }
    
    this.nearestMarkersGroup = L.layerGroup().addTo(this.map);
    
    facilities.forEach((facility, index) => {
      const [lng, lat] = facility.location.coordinates;
      
      // Create numbered markers for nearest facilities
      const numberedIcon = L.divIcon({
        className: 'numbered-marker',
        html: `<div class="marker-number">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
      
      const marker = L.marker([lat, lng], { icon: numberedIcon })
        .addTo(this.nearestMarkersGroup)
        .bindPopup(this.createFacilityPopup(facility));
      
      // Add to sidebar list
      this.addToNearestList(facility, index + 1);
    });
  }
  
  addToNearestList(facility, number) {
    const nearestList = document.getElementById('nearest-facilities-list');
    if (!nearestList) return;
    
    const listItem = document.createElement('div');
    listItem.className = 'nearest-facility-item';
    listItem.innerHTML = `
      <div class="facility-number">${number}</div>
      <div class="facility-info">
        <h4>${facility.name}</h4>
        <p>${this.translateFacilityType(facility.type)} - ${Math.round(facility.distance)}m</p>
        <p>${facility.address}</p>
      </div>
      <button class="btn-directions" data-lng="${facility.location.coordinates[0]}" data-lat="${facility.location.coordinates[1]}">
        দিকনির্দেশ
      </button>
    `;
    
    listItem.addEventListener('click', () => {
      this.map.setView([facility.location.coordinates[1], facility.location.coordinates[0]], 15);
    });
    
    nearestList.appendChild(listItem);
  }
  
  async cacheMapTiles() {
    // Register service worker for offline map tiles
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered');
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }
}

export default new MapService();