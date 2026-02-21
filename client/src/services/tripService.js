import api from '@/lib/api';

/**
 * Trip Service - All API calls for trip management
 */
const tripService = {
  /**
   * Calculate route between origin and destination
   */
  async calculateRoute(origin, destination) {
    try {
      const response = await api.post('/routes/calculate', {
        origin,
        destination,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw {
        message: error.response?.data?.message || 'Failed to calculate route',
        details: error.response?.data?.details || error.message,
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Estimate trip cost based on distance and vehicle specs
   */
  async estimateTripCost(distanceInKm, vehicle) {
    try {
      const response = await api.post('/routes/estimate-cost', {
        distanceInKm,
        vehicle,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error estimating cost:', error);
      throw {
        message: error.response?.data?.message || 'Failed to estimate cost',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Create a new trip
   */
  async createTrip(tripData) {
    try {
      const response = await api.post('/trips', tripData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw {
        message: error.response?.data?.message || 'Failed to create trip',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Dispatch trip (change status from Draft to Dispatched)
   */
  async dispatchTrip(tripId) {
    try {
      const response = await api.patch(`/trips/${tripId}/dispatch`);
      return response.data.data;
    } catch (error) {
      console.error('Error dispatching trip:', error);
      throw {
        message: error.response?.data?.message || 'Failed to dispatch trip',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Get all trips
   */
  async getTrips(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/trips?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch trips',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Get trip by ID with full details
   */
  async getTripById(tripId) {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch trip',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Complete a trip
   */
  async completeTrip(tripId, completionData = {}) {
    try {
      const response = await api.patch(`/trips/${tripId}/complete`, completionData);
      return response.data.data;
    } catch (error) {
      console.error('Error completing trip:', error);
      throw {
        message: error.response?.data?.message || 'Failed to complete trip',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Update trip details
   */
  async updateTrip(tripId, updateData) {
    try {
      const response = await api.patch(`/trips/${tripId}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw {
        message: error.response?.data?.message || 'Failed to update trip',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Send trip completion email notification
   */
  async sendTripCompletionEmail(tripId) {
    try {
      const response = await api.post(
        `/notifications/send-trip-completion/${tripId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw {
        message: error.response?.data?.message || 'Failed to send email',
        details: error.response?.data?.details || error.message,
      };
    }
  },

  /**
   * Check route service availability
   */
  async checkRouteServiceHealth() {
    try {
      const response = await api.get('/routes/health');
      return response.data.data;
    } catch (error) {
      console.error('Error checking route service:', error);
      return { status: 'unavailable' };
    }
  },

  /**
   * Check email service availability
   */
  async checkEmailServiceHealth() {
    try {
      const response = await api.get('/notifications/health');
      return response.data.data;
    } catch (error) {
      console.error('Error checking email service:', error);
      return { status: 'unavailable' };
    }
  },
};

export default tripService;
