import { useState, useCallback } from 'react';
import tripService from '../services/tripService';

/**
 * Custom hook for route calculation
 * Handles origin/destination coordinate validation and API calls
 */
export const useRouteCalculation = () => {
  const [routeData, setRouteData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validate coordinate format and ranges
   */
  const validateCoordinates = useCallback((coord, name) => {
    if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
      throw new Error(`Invalid ${name} format. Must be { lat: number, lng: number }`);
    }
    if (coord.lat < -90 || coord.lat > 90) {
      throw new Error(`Invalid latitude for ${name}. Must be between -90 and 90`);
    }
    if (coord.lng < -180 || coord.lng > 180) {
      throw new Error(`Invalid longitude for ${name}. Must be between -180 and 180`);
    }
  }, []);

  /**
   * Calculate route between two points
   */
  const calculateRoute = useCallback(async (origin, destination) => {
    setLoading(true);
    setError(null);
    setRouteData(null);

    try {
      // Validate coordinates
      validateCoordinates(origin, 'Origin');
      validateCoordinates(destination, 'Destination');

      // Calculate route
      const route = await tripService.calculateRoute(origin, destination);

      setRouteData(route);
      return route;
    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate route';
      setError(errorMessage);
      console.error('Route calculation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateCoordinates]);

  /**
   * Estimate trip cost
   */
  const estimateCost = useCallback(async (distanceInKm, vehicle) => {
    try {
      setError(null);

      if (!distanceInKm || distanceInKm <= 0) {
        throw new Error('Distance must be greater than 0');
      }

      if (!vehicle || !vehicle.fuelConsumption || !vehicle.fuelPrice) {
        throw new Error('Vehicle must have fuelConsumption and fuelPrice');
      }

      const cost = await tripService.estimateTripCost(distanceInKm, vehicle);
      setCostData(cost);
      return cost;
    } catch (err) {
      const errorMessage = err.message || 'Failed to estimate cost';
      setError(errorMessage);
      console.error('Cost estimation error:', err);
      throw err;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setRouteData(null);
    setCostData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    routeData,
    costData,
    loading,
    error,
    calculateRoute,
    estimateCost,
    reset,
    validateCoordinates,
  };
};

export default useRouteCalculation;
