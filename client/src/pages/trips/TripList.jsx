import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from '../../components/trips/TripCard';
import tripService from '../../services/tripService';
import '../../styles/trips.css';

/**
 * Trip List Page
 * Displays all trips with filters and ability to mark trips as complete
 */
const TripList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
  const [successMessage, setSuccessMessage] = useState(null);
  const [completingTripId, setCompletingTripId] = useState(null);

  /**
   * Fetch trips on mount and when filter changes
   */
  useEffect(() => {
    fetchTrips();
  }, [filter]);

  /**
   * Fetch trips from API
   */
  const fetchTrips = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }

      const data = await tripService.getTrips(filters);
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle trip completion
   */
  const handleMarkComplete = async (tripId) => {
    setCompletingTripId(tripId);

    try {
      // Complete the trip
      const completedTrip = await tripService.completeTrip(tripId);

      // Update local state
      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip._id === tripId ? { ...trip, status: 'completed' } : trip
        )
      );

      setSuccessMessage(`✓ Trip completed successfully!`);

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh trips list
      setTimeout(() => fetchTrips(), 1000);
    } catch (err) {
      setError(err.message || 'Failed to complete trip');
    } finally {
      setCompletingTripId(null);
    }
  };

  /**
   * Handle view trip details
   */
  const handleViewDetails = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  /**
   * Get filtered trips
   */
  const getFilteredTrips = () => {
    if (filter === 'all') {
      return trips;
    }
    return trips.filter((trip) => trip.status === filter);
  };

  const filteredTrips = getFilteredTrips();

  // Stats
  const stats = {
    total: trips.length,
    pending: trips.filter((t) => t.status === 'pending').length,
    inProgress: trips.filter((t) => t.status === 'in-progress').length,
    completed: trips.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="trips-container">
      {/* Header */}
      <div className="trips-header">
        <div>
          <h1>📦 Trip Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
            {stats.total} total trips • {stats.pending} pending • {stats.inProgress}{' '}
            in progress
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/trips/create')}
        >
          + Create New Trip
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

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`btn ${
            filter === 'all' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setFilter('all')}
          disabled={loading}
        >
          All Trips ({stats.total})
        </button>
        <button
          className={`btn ${
            filter === 'pending' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setFilter('pending')}
          disabled={loading}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`btn ${
            filter === 'in-progress' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setFilter('in-progress')}
          disabled={loading}
        >
          In Progress ({stats.inProgress})
        </button>
        <button
          className={`btn ${
            filter === 'completed' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setFilter('completed')}
          disabled={loading}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center" style={{ padding: '3rem' }}>
          <div
            className="loading-spinner"
            style={{
              width: '2rem',
              height: '2rem',
              margin: '0 auto 1rem',
            }}
          ></div>
          <p style={{ color: '#6c757d' }}>Loading trips...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTrips.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            color: '#6c757d',
          }}
        >
          <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            {filter === 'all'
              ? 'No trips found. Create your first trip!'
              : `No ${filter} trips found.`}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/trips/create')}
          >
            Create Trip
          </button>
        </div>
      )}

      {/* Trip Cards Grid */}
      {!loading && filteredTrips.length > 0 && (
        <div className="trip-list-container">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              loading={completingTripId === trip._id}
              onViewDetails={handleViewDetails}
              onMarkComplete={handleMarkComplete}
            />
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {!loading && filteredTrips.length > 0 && (
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={fetchTrips}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default TripList;
