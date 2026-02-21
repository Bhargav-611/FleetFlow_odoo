/**
 * Route Service (Frontend)
 * Handles API calls for route calculation and ETA
 */

import api from '../lib/api';

/**
 * Calculate route between two coordinates
 * @param {Object} origin - { lat: number, lng: number }
 * @param {Object} destination - { lat: number, lng: number }
 * @returns {Promise<Object>} { distanceInKm, durationInMinutes, polyline }
 */
export const calculateRoute = async (origin, destination) => {
    try {
        const response = await api.post('/routes/calculate', {
            origin,
            destination,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error calculating route:', error);
        throw error;
    }
};

/**
 * Calculate multiple routes from single origin
 * @param {Object} origin - Starting point
 * @param {Array} destinations - Array of destinations
 * @returns {Promise<Array>} Array of routes
 */
export const calculateBatchRoutes = async (origin, destinations) => {
    try {
        const response = await api.post('/routes/batch', {
            origin,
            destinations,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error calculating batch routes:', error);
        throw error;
    }
};

/**
 * Estimate trip cost based on distance and vehicle specs
 * @param {number} distanceInKm - Distance in kilometers
 * @param {Object} vehicleSpecs - Vehicle specifications
 * @returns {Promise<Object>} Cost breakdown
 */
export const estimateTripCost = async (distanceInKm, vehicleSpecs) => {
    try {
        const response = await api.post('/routes/estimate-cost', {
            distanceInKm,
            vehicleSpecs,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error estimating trip cost:', error);
        throw error;
    }
};

/**
 * Get distance matrix for multiple destinations
 * @param {Object} origin - Starting point
 * @param {Array} destinations - Array of destinations
 * @returns {Promise<Object>} Distance matrix
 */
export const getDistanceMatrix = async (origin, destinations) => {
    try {
        const response = await api.post('/routes/distance-matrix', {
            origin,
            destinations,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting distance matrix:', error);
        throw error;
    }
};

/**
 * Check if route service is available
 * @returns {Promise<Boolean>} Service availability
 */
export const checkRouteServiceHealth = async () => {
    try {
        const response = await api.get('/routes/health');
        return response.data.success;
    } catch (error) {
        console.warn('Route service unavailable:', error.message);
        return false;
    }
};

export default {
    calculateRoute,
    calculateBatchRoutes,
    estimateTripCost,
    getDistanceMatrix,
    checkRouteServiceHealth,
};
