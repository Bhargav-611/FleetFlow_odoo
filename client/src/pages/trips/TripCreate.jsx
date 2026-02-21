import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '../../components/trips/TripForm';
import RouteMap from '../../components/trips/RouteMap';
import TripStats from '../../components/trips/TripStats';
import useRouteCalculation from '../../hooks/useRouteCalculation';
import tripService from '../../services/tripService';
import api from '@/lib/api';
import '../../styles/trips.css';

/**
 * Trip Create Page
 * Main page for creating new trips with route calculation and map display
 */
const TripCreate = () => {
  const navigate = useNavigate();
  const {
    routeData,
    costData,
    loading: routeLoading,
    error: routeError,
    calculateRoute,
    estimateCost,
    reset: resetRoute,
  } = useRouteCalculation();

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Fetch drivers and vehicles on mount
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, vehiclesRes] = await Promise.all([
          api.get('/drivers'),
          api.get('/vehicles'),
        ]);

        setDrivers(driversRes.data.data || []);
        setVehicles(vehiclesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFormError('Failed to load drivers and vehicles');
      }
    };

    fetchData();
  }, []);

  /**
   * Handle route calculation
   */
  const handleRouteCalculate = async (origin, destination, vehicle) => {
    try {
      setFormError(null);

      // Calculate route
      await calculateRoute(origin, destination);

      // Estimate cost
      const distance = (await calculateRoute(origin, destination)).distanceInKm;
      await estimateCost(distance, vehicle);
    } catch (error) {
      setFormError(error.message || 'Failed to calculate route');
    }
  };

  /**
   * Handle trip creation
   */
  const handleTripCreate = async (tripData) => {
    setTripLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const createdTrip = await tripService.createTrip(tripData);

      setSuccessMessage(
        `✓ Trip created successfully! Trip ID: ${createdTrip._id}`
      );

      // Reset form and route
      resetRoute();

      // Navigate to details page after 2 seconds
      setTimeout(() => {
        navigate(`/trips/${createdTrip._id}`);
      }, 2000);
    } catch (error) {
      setFormError(error.message || 'Failed to create trip');
    } finally {
      setTripLoading(false);
    }
  };

  return (
    <div className="trips-container">
      {/* Header */}
      <div className="trips-header">
        <h1>🚚 Create New Trip</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/trips')}
        >
          ← Back to Trips
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="toast-message toast-success">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {formError && (
        <div className="toast-message toast-error">
          {formError}
        </div>
      )}

      {/* Main Layout */}
      <div className="trip-create-layout">
        {/* Left: Form Section */}
        <div className="trip-create-form-section">
          <TripForm
            drivers={drivers}
            vehicles={vehicles}
            loading={tripLoading}
            routeLoading={routeLoading}
            error={routeError}
            routeData={routeData}
            costData={costData}
            onRouteCalculate={handleRouteCalculate}
            onSubmit={handleTripCreate}
          />
        </div>

        {/* Right: Map & Stats Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Route Stats Card */}
          <TripStats
            routeData={routeData}
            costData={costData}
            loading={routeLoading}
          />

          {/* Route Map */}
          <div className="trip-create-map-section">
            <RouteMap
              origin={
                routeData
                  ? {
                      lat: parseFloat(
                        document.querySelector('input[name="originLat"]')?.value || 0
                      ),
                      lng: parseFloat(
                        document.querySelector('input[name="originLng"]')?.value || 0
                      ),
                    }
                  : null
              }
              destination={
                routeData
                  ? {
                      lat: parseFloat(
                        document.querySelector('input[name="destinationLat"]')
                          ?.value || 0
                      ),
                      lng: parseFloat(
                        document.querySelector('input[name="destinationLng"]')
                          ?.value || 0
                      ),
                    }
                  : null
              }
              polyline={routeData?.polyline || null}
              loading={routeLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCreate;
