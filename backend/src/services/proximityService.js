// backend/src/services/proximityService.js
import HealthFacility from '../models/HealthFacility.js';
import HealthWorker from '../models/HealthWorker.js';

class ProximityService {
  async findNearestFacilities(userLocation, maxDistance = 10000, limit = 10) {
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
}

export default new ProximityService();