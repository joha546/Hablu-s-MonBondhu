// backend/src/utils/proximityService.js
import HealthFacility from '../models/HealthFacility.js';
import HealthWorker from '../models/HealthWorker.js';
import { logger } from './logger.js';

class ProximityService {
  async findNearestFacilities(userLocation, maxDistance = 10000, limit = 10) {
    try {
      // First, get facilities within maxDistance (in meters)
      const facilities = await HealthFacility.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: maxDistance
          }
        }
      }).limit(limit * 2); // Get more than needed for re-ranking
      
      // Calculate comprehensive accessibility score for each facility
      const scoredFacilities = facilities.map(facility => {
        const distance = this.calculateDistance(userLocation, facility.location.coordinates);
        const accessibilityScore = this.calculateAccessibilityScore(facility);
        
        // Combined score: lower is better
        // Weight distance 60% and accessibility 40%
        const combinedScore = (distance * 0.6) + ((100 - accessibilityScore) * 40);
        
        return {
          ...facility.toObject(),
          distance,
          accessibilityScore,
          combinedScore
        };
      });
      
      // Sort by combined score (lower is better)
      return scoredFacilities.sort((a, b) => a.combinedScore - b.combinedScore).slice(0, limit);
    } catch (error) {
      logger.error('Error finding nearest facilities:', error);
      throw error;
    }
  }
  
  calculateAccessibilityScore(facility) {
    let score = 50; // Base score
    
    // Add points for road access
    if (facility.accessibility.roadAccess) {
      score += 20;
    }
    
    // Add points for public transport
    if (facility.accessibility.publicTransport) {
      score += 20;
    }
    
    // Add points for transport options
    const transportOptions = facility.accessibility.transportOptions || [];
    score += transportOptions.length * 5;
    
    // Cap at 100
    return Math.min(score, 100);
  }
  
  calculateDistance(point1, point2) {
    // Haversine formula to calculate distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[1] * Math.PI/180; // φ, λ in radians
    const φ2 = point2[1] * Math.PI/180;
    const Δφ = (point2[1]-point1[1]) * Math.PI/180;
    const Δλ = (point2[0]-point1[0]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  calculateBearing(from, to) {
    const φ1 = from[1] * Math.PI/180;
    const φ2 = to[1] * Math.PI/180;
    const Δλ = (to[0]-from[0]) * Math.PI/180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    const brng = (θ*180/Math.PI + 360) % 360; // in degrees

    // Convert to cardinal direction
    const directions = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম'];
    const index = Math.round(brng / 45) % 8;
    
    return directions[index];
  }
  
  async findNearestHealthWorkers(userLocation, maxDistance = 5000, limit = 10) {
    try {
      const filter = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: maxDistance
          }
        }
      };
      
      const workers = await HealthWorker.find(filter)
        .limit(limit);
      
      // Calculate distance for each worker
      const workersWithDistance = workers.map(worker => {
        const distance = this.calculateDistance(userLocation, worker.location.coordinates);
        return {
          ...worker.toObject(),
          distance
        };
      });
      
      // Sort by distance
      return workersWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      logger.error('Error finding nearest health workers:', error);
      throw error;
    }
  }
  
  async findFacilitiesByType(userLocation, facilityType, maxDistance = 10000, limit = 10) {
    try {
      const facilities = await HealthFacility.find({
        type: facilityType,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: maxDistance
          }
        }
      }).limit(limit);
      
      // Calculate distance for each facility
      const facilitiesWithDistance = facilities.map(facility => {
        const distance = this.calculateDistance(userLocation, facility.location.coordinates);
        return {
          ...facility.toObject(),
          distance
        };
      });
      
      // Sort by distance
      return facilitiesWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      logger.error('Error finding facilities by type:', error);
      throw error;
    }
  }
  
  async findFacilitiesByServices(userLocation, services, maxDistance = 10000, limit = 10) {
    try {
      const facilities = await HealthFacility.find({
        services: { $in: services },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: maxDistance
          }
        }
      }).limit(limit);
      
      // Calculate distance for each facility
      const facilitiesWithDistance = facilities.map(facility => {
        const distance = this.calculateDistance(userLocation, facility.location.coordinates);
        return {
          ...facility.toObject(),
          distance
        };
      });
      
      // Sort by distance
      return facilitiesWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      logger.error('Error finding facilities by services:', error);
      throw error;
    }
  }
}

// Create an instance and export it
const proximityService = new ProximityService();

// Export both the class and the instance
export { ProximityService };
export default proximityService;