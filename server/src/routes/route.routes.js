/**
 * Route Routes
 * API endpoints for route calculation and optimization
 */

const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const { protect } = require('../middleware/auth');

/**
 * POST /api/routes/calculate
 * Calculate route between two coordinates
 * @param {Object} origin - { lat: number, lng: number }
 * @param {Object} destination - { lat: number, lng: number }
 */
router.post('/calculate', protect, routeController.calculateRoute);

/**
 * POST /api/routes/batch
 * Calculate multiple routes from single origin
 * @param {Object} origin - Starting point
 * @param {Array} destinations - Array of destinations
 */
router.post('/batch', protect, routeController.calculateBatchRoutes);

/**
 * POST /api/routes/distance-matrix
 * Get distance matrix for route optimization
 * Useful for TSP (Traveling Salesman Problem) algorithms
 */
router.post('/distance-matrix', protect, routeController.getDistanceMatrix);

/**
 * POST /api/routes/estimate-cost
 * Estimate trip cost based on distance and vehicle specifications
 * Includes fuel cost and fixed operational costs
 */
router.post('/estimate-cost', protect, routeController.estimateTripCost);

/**
 * GET /api/routes/health
 * Health check for OpenRouteService connectivity
 */
router.get('/health', routeController.routeServiceHealth);

module.exports = router;
