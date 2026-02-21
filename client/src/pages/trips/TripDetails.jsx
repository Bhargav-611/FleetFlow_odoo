import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RouteMap from '../../components/trips/RouteMap';
import tripService from '../../services/tripService';
import '../../styles/trips.css';

/**
 * Trip Details Page
 * Shows full trip details with map and cost breakdown
 */
const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Fetch trip details on mount
   */
  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  /**
   * Fetch trip from API
   */
  const fetchTripDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const tripData = await tripService.getTripById(tripId);
      setTrip(tripData);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle trip dispatch (Draft → Dispatched)
   */
  const handleDispatchTrip = async () => {
    setDispatching(true);
    setError(null);

    try {
      const dispatchedTrip = await tripService.dispatchTrip(tripId);
      setTrip(dispatchedTrip);
      setSuccessMessage('✓ Trip dispatched successfully! Driver and vehicle are now on trip.');
    } catch (err) {
      setError(err.message || 'Failed to dispatch trip');
    } finally {
      setDispatching(false);
    }
  };

  /**
   * Handle trip completion
   */
  const handleCompleteTrip = async () => {
    setCompleting(true);
    setError(null);

    try {
      const completedTrip = await tripService.completeTrip(tripId, {
        endOdometer: 0,
        revenue: trip.revenue || 0,
        distance: trip.distance || 0,
      });

      setTrip(completedTrip);
      setSuccessMessage('✓ Trip completed successfully! Email sent to driver.');

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/trips');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to complete trip');
    } finally {
      setCompleting(false);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Format time
   */
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status badge
   */
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Draft: 'trip-status-pending',
      Dispatched: 'trip-status-in-progress',
      Completed: 'trip-status-completed',
      Cancelled: 'trip-status-cancelled',
    };
    return statusMap[status] || 'trip-status-pending';
  };

  /**
   * Get driver name
   */
  const getDriverName = () => {
    if (!trip) return 'Unknown';
    if (typeof trip.driver === 'object') {
      return trip.driver.name || 'Unknown Driver';
    }
    return 'Unknown Driver';
  };

  /**
   * Get vehicle info
   */
  const getVehicleInfo = () => {
    if (!trip) return { name: 'Unknown', plate: '' };
    if (typeof trip.vehicle === 'object') {
      return {
        name: trip.vehicle.name || 'Unknown Vehicle',
        plate: trip.vehicle.licensePlate || '',
      };
    }
    return { name: 'Unknown Vehicle', plate: '' };
  };

  // Loading state
  if (loading) {
    return (
      <div className="trips-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            className="loading-spinner"
            style={{
              width: '2rem',
              height: '2rem',
              margin: '0 auto 1rem',
            }}
          ></div>
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="trips-container">
        <div className="trips-header">
          <h1>Trip Details</h1>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/trips')}
          >
            ← Back to Trips
          </button>
        </div>

        <div
          style={{
            background: '#f8d7da',
            color: '#842029',
            padding: '1.5rem',
            borderRadius: '8px',
            marginTop: '2rem',
          }}
        >
          <p>{error || 'Trip not found'}</p>
        </div>
      </div>
    );
  }

  const driverName = getDriverName();
  const vehicleInfo = getVehicleInfo();

  return (
    <div className="trips-container">
      {/* Header */}
      <div className="trips-header">
        <div>
          <h1>Trip Details</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
            Trip #{trip._id?.slice(-6)?.toUpperCase() || 'N/A'}
          </p>
        </div>
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
      {error && (
        <div className="toast-message toast-error">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="trip-details-layout">
        {/* Left: Map */}
        <div className="trip-details-map">
          <RouteMap
            origin={
              trip.routePolyline && trip.routePolyline.length > 0
                ? trip.routePolyline[0]
                : null
            }
            destination={
              trip.routePolyline && trip.routePolyline.length > 0
                ? trip.routePolyline[trip.routePolyline.length - 1]
                : null
            }
            polyline={trip.routePolyline || null}
          />
        </div>

        {/* Right: Sidebar */}
        <div className="trip-details-sidebar">
          {/* Status Card */}
          <div className="trip-details-card">
            <h3>Trip Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span
                className={`trip-status-badge ${getStatusBadgeClass(
                  trip.status
                )}`}
                style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
              >
                {trip.status || 'Pending'}
              </span>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                {formatDate(trip.createdAt)} at {formatTime(trip.createdAt)}
              </span>
            </div>
          </div>

          {/* Assignment Card */}
          <div className="trip-details-card">
            <h3>Assignment</h3>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Driver</span>
              <span className="trip-detail-value">{driverName}</span>
            </div>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Vehicle</span>
              <span className="trip-detail-value">
                {vehicleInfo.name}
                {vehicleInfo.plate && (
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    {vehicleInfo.plate}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Route Card */}
          <div className="trip-details-card">
            <h3>Route</h3>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Origin</span>
              <span className="trip-detail-value">{trip.origin || 'N/A'}</span>
            </div>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Destination</span>
              <span className="trip-detail-value">
                {trip.destination || 'N/A'}
              </span>
            </div>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Distance</span>
              <span className="trip-detail-value">
                {trip.distance
                  ? `${Math.round(trip.distance)} km`
                  : 'N/A'}
              </span>
            </div>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Duration</span>
              <span className="trip-detail-value">
                {trip.duration
                  ? `${Math.round(trip.duration)} minutes`
                  : 'N/A'}
              </span>
            </div>
            <div className="trip-detail-item">
              <span className="trip-detail-label">ETA</span>
              <span className="trip-detail-value">
                {trip.estimatedDuration
                  ? `${Math.round(trip.estimatedDuration)} minutes`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Cargo Card */}
          <div className="trip-details-card">
            <h3>Cargo</h3>
            <div className="trip-detail-item">
              <span className="trip-detail-label">Weight</span>
              <span className="trip-detail-value">
                {trip.cargo ? `${trip.cargo} kg` : 'N/A'}
              </span>
            </div>
            {trip.notes && (
              <div className="trip-detail-item">
                <span className="trip-detail-label">Notes</span>
                <span className="trip-detail-value">
                  {trip.notes}
                </span>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="trip-details-card">
            <h3>Cost Breakdown</h3>

            <div className="trip-cost-breakdown">
              <div className="trip-cost-row">
                <span className="trip-cost-label">Fuel Cost</span>
                <span className="trip-cost-value">
                  {formatCurrency(trip.estimatedFuelCost || 0)}
                </span>
              </div>
              <div className="trip-cost-row">
                <span className="trip-cost-label">Fixed Cost</span>
                <span className="trip-cost-value">
                  {formatCurrency(trip.estimatedFixedCost || 0)}
                </span>
              </div>
              <div className="trip-cost-row total">
                <span className="trip-cost-label">Total Cost</span>
                <span className="trip-cost-value">
                  {formatCurrency(
                    trip.estimatedTotalCost ||
                    (trip.estimatedFuelCost || 0) +
                    (trip.estimatedFixedCost || 0)
                  )}
                </span>
              </div>

              {trip.actualTotalCost && (
                <>
                  <div
                    style={{
                      margin: '1rem 0 0 0',
                      paddingTop: '1rem',
                      borderTop: '2px solid #dee2e6',
                    }}
                  ></div>
                  <div className="trip-cost-row">
                    <span className="trip-cost-label">Actual Cost</span>
                    <span className="trip-cost-value">
                      {formatCurrency(trip.actualTotalCost)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Email Tracking */}
          {trip.completionEmailSent && (
            <div
              className="trip-details-card"
              style={{
                background: '#d1e7dd',
                borderLeft: '4px solid #28a745',
              }}
            >
              <p style={{ margin: 0, color: '#0f5132', fontSize: '0.9rem' }}>
                ✓ Completion email sent to {getDriverName()} on{' '}
                {formatDate(trip.completionEmailSentAt)} at{' '}
                {formatTime(trip.completionEmailSentAt)}
              </p>
            </div>
          )}

          {/* Actions */}
          {trip.status === 'Draft' && (
            <div className="trip-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleDispatchTrip}
                disabled={dispatching}
              >
                {dispatching && <span className="loading-spinner"></span>}
                {dispatching ? 'Dispatching...' : '🚀 Dispatch Trip'}
              </button>
            </div>
          )}

          {trip.status === 'Dispatched' && (
            <div className="trip-actions">
              <button
                className="btn btn-success btn-lg"
                onClick={handleCompleteTrip}
                disabled={completing}
              >
                {completing && <span className="loading-spinner"></span>}
                {completing ? 'Completing...' : '✓ Complete Trip'}
              </button>
            </div>
          )}

          {trip.status === 'Completed' && (
            <div
              style={{
                background: '#d1e7dd',
                color: '#0f5132',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              ✓ Trip Completed
            </div>
          )}

          {trip.status === 'Cancelled' && (
            <div
              style={{
                background: '#f8d7da',
                color: '#842029',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              ✗ Trip Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
