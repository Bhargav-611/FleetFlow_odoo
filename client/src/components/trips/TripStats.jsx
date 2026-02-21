import React from 'react';

/**
 * Trip Stats Card Component
 * Displays route distance, duration, and cost information
 */
const TripStats = ({ routeData, costData, vehicle, loading = false }) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Format distance
  const formatDistance = (km) => {
    if (!km) return '0 km';
    return `${Math.round(km)} km`;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${Math.round(mins)} min`;
  };

  if (!routeData && !costData) {
    return null;
  }

  if (loading) {
    return (
      <div className="route-stats-card">
        <div
          className="skeleton-loader"
          style={{ height: '200px', marginBottom: '1rem' }}
        ></div>
      </div>
    );
  }

  // Calculate fuel efficiency
  const calculateFuelEfficiency = () => {
    if (!routeData || !vehicle || !vehicle.fuelConsumption) return null;
    const consumption = vehicle.fuelConsumption;
    const consumption_text = `${consumption} km/liter`;
    return consumption_text;
  };

  return (
    <div className="route-stats-card">
      <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>
        Route Summary
      </h3>

      {/* Stats Grid */}
      <div className="route-stats-grid">
        {/* Distance */}
        {routeData?.distanceInKm && (
          <div className="route-stat-item">
            <div className="route-stat-label">📍 Distance</div>
            <div className="route-stat-value">
              {formatDistance(routeData.distanceInKm)}
            </div>
          </div>
        )}

        {/* Duration */}
        {routeData?.durationInMinutes && (
          <div className="route-stat-item">
            <div className="route-stat-label">⏱️ Duration</div>
            <div className="route-stat-value">
              {formatDuration(routeData.durationInMinutes)}
            </div>
          </div>
        )}

        {/* Fuel Consumption */}
        {vehicle?.fuelConsumption && (
          <div className="route-stat-item">
            <div className="route-stat-label">⛽ Mileage</div>
            <div className="route-stat-value">
              {vehicle.fuelConsumption} km/l
            </div>
          </div>
        )}

        {/* Fuel Price */}
        {vehicle?.fuelPrice && (
          <div className="route-stat-item">
            <div className="route-stat-label">💰 Fuel Price</div>
            <div className="route-stat-value">
              ₹{vehicle.fuelPrice}/liter
            </div>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      {costData && (
        <div className="route-stats-summary">
          <div className="summary-item">
            <span>Fuel Cost:</span>
            <strong>{formatCurrency(costData.fuelCost)}</strong>
          </div>
          <div className="summary-item">
            <span>Fixed Cost:</span>
            <strong>{formatCurrency(costData.fixedCost)}</strong>
          </div>
          <div
            className="summary-item"
            style={{
              gridColumn: '1 / -1',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              marginTop: '0.5rem',
              fontSize: '1.1rem',
            }}
          >
            <span>Total Cost:</span>
            <strong>{formatCurrency(costData.totalCost)}</strong>
          </div>
        </div>
      )}

      {/* Route Data Meta */}
      {routeData?.source && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.8rem',
            opacity: 0.8,
          }}
        >
          Data from: <strong>{routeData.source}</strong> •
          <span style={{ marginLeft: '0.25rem' }}>
            {new Date(routeData.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default TripStats;
