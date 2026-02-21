import React from 'react';

/**
 * Trip Card Component
 * Displays individual trip information in card format
 */
const TripCard = ({
  trip,
  onViewDetails = () => {},
  onMarkComplete = () => {},
  loading = false,
}) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'trip-status-pending',
      'in-progress': 'trip-status-in-progress',
      completed: 'trip-status-completed',
      cancelled: 'trip-status-cancelled',
    };
    return statusMap[status] || 'trip-status-pending';
  };

  // Get driver name
  const getDriverName = () => {
    if (typeof trip.driver === 'object') {
      return trip.driver.name || trip.driver.email || 'Unknown Driver';
    }
    return 'Unknown Driver';
  };

  // Get vehicle name
  const getVehicleName = () => {
    if (typeof trip.vehicle === 'object') {
      return trip.vehicle.name || trip.vehicle.licensePlate || 'Unknown Vehicle';
    }
    return 'Unknown Vehicle';
  };

  // Get vehicle plate
  const getVehiclePlate = () => {
    if (typeof trip.vehicle === 'object') {
      return trip.vehicle.licensePlate || '';
    }
    return '';
  };

  const driverName = getDriverName();
  const vehicleName = getVehicleName();
  const vehiclePlate = getVehiclePlate();

  return (
    <div className="trip-card">
      {/* Card Header */}
      <div className="trip-card-header">
        <div>
          <h3 className="trip-card-title">
            Trip {trip._id?.slice(-6)?.toUpperCase() || 'N/A'}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              color: '#6c757d',
              fontSize: '0.85rem',
            }}
          >
            {formatDate(trip.createdAt)} at {formatTime(trip.createdAt)}
          </p>
        </div>
        <span className={`trip-status-badge ${getStatusClass(trip.status)}`}>
          {trip.status || 'pending'}
        </span>
      </div>

      {/* Route Information */}
      <div className="trip-card-route">
        <span>📍 {trip.origin || 'Start'}</span>
        <span className="trip-card-route-arrow">→</span>
        <span>📍 {trip.destination || 'End'}</span>
      </div>

      {/* Trip Details Meta */}
      <div className="trip-card-meta">
        {/* Driver */}
        <div className="trip-card-info">
          <span className="trip-card-info-label">Driver</span>
          <span className="trip-card-info-value">{driverName}</span>
        </div>

        {/* Vehicle */}
        <div className="trip-card-info">
          <span className="trip-card-info-label">Vehicle</span>
          <span className="trip-card-info-value">
            {vehicleName}
            {vehiclePlate && (
              <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.25rem', color: '#666' }}>
                {vehiclePlate}
              </span>
            )}
          </span>
        </div>

        {/* Distance */}
        {trip.distance && (
          <div className="trip-card-info">
            <span className="trip-card-info-label">Distance</span>
            <span className="trip-card-info-value">
              {Math.round(trip.distance)} km
            </span>
          </div>
        )}

        {/* Duration */}
        {trip.duration && (
          <div className="trip-card-info">
            <span className="trip-card-info-label">Duration</span>
            <span className="trip-card-info-value">
              {Math.round(trip.duration)} min
            </span>
          </div>
        )}

        {/* Cost */}
        {trip.totalCost && (
          <div className="trip-card-info">
            <span className="trip-card-info-label">Cost</span>
            <span className="trip-card-info-value">
              ₹{Math.round(trip.totalCost).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Cargo */}
        {trip.cargo && (
          <div className="trip-card-info">
            <span className="trip-card-info-label">Cargo</span>
            <span className="trip-card-info-value">
              {trip.cargo} kg
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="trip-card-footer">
        <button
          className="btn btn-primary"
          onClick={() => onViewDetails(trip._id)}
          disabled={loading}
        >
          🔍 View Details
        </button>

        {trip.status !== 'completed' && (
          <button
            className="btn btn-success"
            onClick={() => onMarkComplete(trip._id)}
            disabled={loading || trip.status === 'cancelled'}
          >
            ✓ Complete
          </button>
        )}

        {trip.status === 'completed' && (
          <button
            className="btn btn-secondary"
            disabled
            style={{ opacity: 0.6 }}
          >
            ✓ Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default TripCard;
