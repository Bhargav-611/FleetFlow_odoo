/**
 * OpenRouteService Integration
 * Handles route calculation, distance, ETA, and polylines
 */

const axios = require('axios');
const config = require('../config/env');
const { ApiErrorFactory } = require('../utils/apiError');

class MapService {
    constructor() {
        this.apiKey = config.openroute.apiKey;
        this.baseUrl = config.openroute.baseUrl;
        this.enabled = config.openroute.enabled;

        if (this.enabled) {
            this.client = axios.create({
                baseURL: this.baseUrl,
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
        }
    }

    /**
     * Validate if MapService is enabled
     * @throws {ApiError} if OpenRouteService is not configured
     */
    validateEnabled() {
        if (!this.enabled) {
            throw ApiErrorFactory.serviceUnavailable(
                'OpenRouteService (Maps/Routing)'
            );
        }
    }

    /**
     * Validate coordinate format
     * @param {Object} coordinate - { lat: number, lng: number }
     * @throws {ApiError} if invalid format
     */
    validateCoordinate(coordinate, name = 'Coordinate') {
        if (!coordinate || typeof coordinate.lat !== 'number' || typeof coordinate.lng !== 'number') {
            throw ApiErrorFactory.badRequest(
                `${name} must have lat and lng as numbers`
            );
        }
        if (coordinate.lat < -90 || coordinate.lat > 90) {
            throw ApiErrorFactory.badRequest(
                `${name} latitude must be between -90 and 90`
            );
        }
        if (coordinate.lng < -180 || coordinate.lng > 180) {
            throw ApiErrorFactory.badRequest(
                `${name} longitude must be between -180 and 180`
            );
        }
    }

    /**
     * Calculate route between two coordinates
     * @param {Object} origin - { lat: number, lng: number }
     * @param {Object} destination - { lat: number, lng: number }
     * @returns {Promise<Object>} { distanceInKm, durationInMinutes, polyline }
     */
    async calculateRoute(origin, destination) {
        try {
            this.validateCoordinate(origin, 'Origin');
            this.validateCoordinate(destination, 'Destination');

            if (!this.enabled) {
                // Fallback: Calculate approximate route using Haversine formula
                return this._calculateApproximateRoute(origin, destination);
            }

            // OpenRouteService expects [lng, lat] format
            const coordinates = [
                [origin.lng, origin.lat],
                [destination.lng, destination.lat],
            ];

            const response = await this.client.post(
                '/directions/driving-car',
                {
                    coordinates,
                    geometry: 'geojson', // Get polyline as GeoJSON
                    instructions: false,
                },
                {
                    params: {
                        api_key: this.apiKey,
                    },
                }
            );

            // Extract relevant data
            const route = response.data.routes[0];
            const summary = route.summary;

            // Convert meters to km
            const distanceInKm = Math.round((summary.distance / 1000) * 100) / 100;

            // Convert seconds to minutes
            const durationInMinutes = Math.round(summary.duration / 60);

            // Extract polyline coordinates (GeoJSON format)
            const polyline = route.geometry.coordinates;

            return {
                distanceInKm,
                durationInMinutes,
                polyline, // Array of [lng, lat] coordinates
                source: 'openroute',
                timestamp: new Date(),
            };
        } catch (error) {
            // If OpenRouteService fails, fall back to approximate calculation
            console.warn('⚠️ OpenRouteService unavailable, using approximate calculation:', error.message);
            return this._calculateApproximateRoute(origin, destination);
        }
    }

    /**
     * Calculate approximate route using Haversine formula for fallback
     * @param {Object} origin - { lat: number, lng: number }
     * @param {Object} destination - { lat: number, lng: number }
     * @returns {Promise<Object>} { distanceInKm, durationInMinutes, polyline }
     */
    _calculateApproximateRoute(origin, destination) {
        // Haversine formula for great-circle distance
        const R = 6371; // Earth's radius in km
        const dLat = this._toRad(destination.lat - origin.lat);
        const dLng = this._toRad(destination.lng - origin.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this._toRad(origin.lat)) * Math.cos(this._toRad(destination.lat)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceInKm = Math.round((R * c) * 100) / 100; // Round to 2 decimals

        // Estimate duration: avg 60 km/h + 10 min buffer for city roads
        const durationInMinutes = Math.round((distanceInKm / 60) * 60 + 10);

        // Generate polyline: simple straight line with intermediate points
        const polyline = this._generatePolyline(origin, destination, 10);

        return {
            distanceInKm,
            durationInMinutes,
            polyline,
            source: 'fallback', // Indicate this is approximate
            timestamp: new Date(),
        };
    }

    /**
     * Convert degrees to radians
     */
    _toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Generate approximate polyline between two points
     */
    _generatePolyline(origin, destination, points = 10) {
        const polyline = [];
        
        for (let i = 0; i <= points; i++) {
            const fraction = i / points;
            const lat = origin.lat + (destination.lat - origin.lat) * fraction;
            const lng = origin.lng + (destination.lng - origin.lng) * fraction;
            polyline.push([lng, lat]); // [lng, lat] format for consistency
        }
        
        return polyline;
    }

    /**
     * Estimate fuel cost for a trip
     * @param {number} distanceInKm - Distance in kilometers
     * @param {number} fuelConsumption - Vehicle fuel consumption (km/liter)
     * @param {number} fuelPrice - Current fuel price per liter
     * @returns {number} Estimated fuel cost
     */
    estimateFuelCost(distanceInKm, fuelConsumption, fuelPrice) {
        if (distanceInKm <= 0 || fuelConsumption <= 0 || fuelPrice <= 0) {
            throw ApiErrorFactory.badRequest(
                'Distance, fuel consumption, and price must be positive numbers'
            );
        }

        const litersNeeded = distanceInKm / fuelConsumption;
        const cost = litersNeeded * fuelPrice;

        return Math.round(cost * 100) / 100; // Round to 2 decimals
    }

    /**
     * Calculate estimated trip cost
     * @param {Object} trip - Trip data
     * @returns {Object} { fuelCost, fixedCost, totalCost }
     */
    calculateTripCost(distanceInKm, vehicle) {
        try {
            const fuelConsumption = vehicle.fuelConsumption || 5; // Default 5 km/liter
            const fuelPrice = vehicle.fuelPrice || 100; // Default 100 per liter
            const fixedCostPerKm = vehicle.fixedCostPerKm || 5; // Driver salary, maintenance, etc.

            const fuelCost = this.estimateFuelCost(
                distanceInKm,
                fuelConsumption,
                fuelPrice
            );

            const fixedCost = Math.round((distanceInKm * fixedCostPerKm) * 100) / 100;
            const totalCost = Math.round((fuelCost + fixedCost) * 100) / 100;

            return {
                distanceInKm,
                fuelCost,
                fixedCost,
                totalCost,
                profitMargin: vehicle.profitMarginPercentage || 20,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Batch calculate routes for multiple destinations
     * @param {Object} origin - Starting point
     * @param {Array} destinations - Array of destination coordinates
     * @returns {Promise<Array>} Array of route calculations
     */
    async calculateBatchRoutes(origin, destinations) {
        try {
            this.validateEnabled();
            this.validateCoordinate(origin, 'Origin');

            if (!Array.isArray(destinations) || destinations.length === 0) {
                throw ApiErrorFactory.badRequest('Destinations must be a non-empty array');
            }

            // Validate all destinations
            destinations.forEach((dest, index) => {
                this.validateCoordinate(dest, `Destination ${index + 1}`);
            });

            // Calculate route for each destination
            const routes = await Promise.allSettled(
                destinations.map(dest => this.calculateRoute(origin, dest))
            );

            // Handle results
            return routes.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return {
                        destination: destinations[index],
                        ...result.value,
                        success: true,
                    };
                } else {
                    return {
                        destination: destinations[index],
                        error: result.reason.message,
                        success: false,
                    };
                }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get distance matrix for multiple origins and destinations
     * Useful for optimization algorithms
     * @param {Object} origin - Single origin
     * @param {Array} destinations - Multiple destinations
     * @returns {Promise<Object>} Distance matrix
     */
    async getDistanceMatrix(origin, destinations) {
        try {
            const routes = await this.calculateBatchRoutes(origin, destinations);

            const matrix = {
                origin,
                destinations,
                matrix: routes.map(route => ({
                    destination: route.destination,
                    distanceInKm: route.distanceInKm,
                    durationInMinutes: route.durationInMinutes,
                    success: route.success,
                })),
            };

            return matrix;
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new MapService();
