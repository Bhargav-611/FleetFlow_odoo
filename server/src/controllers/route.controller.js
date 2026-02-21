/**
 * Route Controller
 * Handles route calculation and ETA endpoints
 */

const mapService = require('../services/map.service');
const { ApiErrorFactory } = require('../utils/apiError');

/**
 * POST /api/routes/calculate
 * Calculate route between two coordinates
 */
exports.calculateRoute = async (req, res, next) => {
    try {
        const { origin, destination } = req.body;

        // Validation
        if (!origin || !destination) {
            throw ApiErrorFactory.badRequest(
                'Both origin and destination coordinates are required'
            );
        }

        // Calculate route
        const routeData = await mapService.calculateRoute(origin, destination);

        res.status(200).json({
            success: true,
            data: routeData,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/routes/batch
 * Calculate routes for multiple destinations from single origin
 */
exports.calculateBatchRoutes = async (req, res, next) => {
    try {
        const { origin, destinations } = req.body;

        if (!origin || !destinations || !Array.isArray(destinations)) {
            throw ApiErrorFactory.badRequest(
                'Origin and destinations array are required'
            );
        }

        const routes = await mapService.calculateBatchRoutes(origin, destinations);

        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/routes/distance-matrix
 * Get distance matrix for optimization
 */
exports.getDistanceMatrix = async (req, res, next) => {
    try {
        const { origin, destinations } = req.body;

        if (!origin || !destinations) {
            throw ApiErrorFactory.badRequest(
                'Origin and destinations are required'
            );
        }

        const matrix = await mapService.getDistanceMatrix(origin, destinations);

        res.status(200).json({
            success: true,
            data: matrix,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/routes/estimate-cost
 * Estimate trip cost based on distance and vehicle specs
 */
exports.estimateTripCost = async (req, res, next) => {
    try {
        const { distanceInKm, vehicleSpecs } = req.body;

        if (!distanceInKm || !vehicleSpecs) {
            throw ApiErrorFactory.badRequest(
                'distanceInKm and vehicleSpecs are required'
            );
        }

        if (typeof distanceInKm !== 'number' || distanceInKm <= 0) {
            throw ApiErrorFactory.badRequest(
                'distanceInKm must be a positive number'
            );
        }

        const costBreakdown = mapService.calculateTripCost(distanceInKm, vehicleSpecs);

        res.status(200).json({
            success: true,
            data: costBreakdown,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/routes/health
 * Health check for route service
 */
exports.routeServiceHealth = (req, res) => {
    try {
        mapService.validateEnabled();

        res.status(200).json({
            success: true,
            service: 'OpenRouteService',
            status: 'operational',
            timestamp: new Date(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            service: 'OpenRouteService',
            status: 'unavailable',
            reason: error.message,
        });
    }
};
