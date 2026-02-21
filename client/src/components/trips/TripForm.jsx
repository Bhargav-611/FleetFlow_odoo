import React, { useState, useEffect } from 'react';

/**
 * Trip Form Component
 * Form for creating/editing trips with origin/destination inputs
 */
const TripForm = ({
  onSubmit = () => {},
  onRouteCalculate = () => {},
  drivers = [],
  vehicles = [],
  loading = false,
  routeLoading = false,
  error = null,
  routeData = null,
  costData = null,
}) => {
  const [formData, setFormData] = useState({
    driver: '',
    vehicle: '',
    origin: '',
    originLat: '',
    originLng: '',
    destination: '',
    destinationLat: '',
    destinationLng: '',
    cargo: '',
    notes: '',
    costPerKm: '5',
    fuelPrice: '100',
    fuelConsumption: '6',
  });

  const [formErrors, setFormErrors] = useState({});
  const [manualCoords, setManualCoords] = useState(false);

  /**
   * Handle form field changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.driver) errors.driver = 'Driver is required';
    if (!formData.vehicle) errors.vehicle = 'Vehicle is required';
    if (!formData.origin) errors.origin = 'Origin is required';
    if (!formData.destination) errors.destination = 'Destination is required';

    // Only validate coordinates if user explicitly entered them manually
    if (manualCoords) {
      const originLat = parseFloat(formData.originLat);
      const originLng = parseFloat(formData.originLng);
      const destLat = parseFloat(formData.destinationLat);
      const destLng = parseFloat(formData.destinationLng);

      if (
        !originLat ||
        originLat < -90 ||
        originLat > 90 ||
        !originLng ||
        originLng < -180 ||
        originLng > 180
      ) {
        errors.originCoords = 'Invalid origin coordinates';
      }

      if (
        !destLat ||
        destLat < -90 ||
        destLat > 90 ||
        !destLng ||
        destLng < -180 ||
        destLng > 180
      ) {
        errors.destinationCoords = 'Invalid destination coordinates';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle route calculation
   */
  const handleCalculateRoute = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const origin = {
      lat: parseFloat(formData.originLat),
      lng: parseFloat(formData.originLng),
    };

    const destination = {
      lat: parseFloat(formData.destinationLat),
      lng: parseFloat(formData.destinationLng),
    };

    const vehicle = {
      fuelConsumption: parseFloat(formData.fuelConsumption),
      fuelPrice: parseFloat(formData.fuelPrice),
      fixedCostPerKm: parseFloat(formData.costPerKm),
    };

    await onRouteCalculate(origin, destination, vehicle);
  };

  /**
   * Handle form submission (trip creation)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!routeData) {
      setFormErrors({ route: 'Please calculate route first' });
      return;
    }

    const tripData = {
      driver: formData.driver,
      vehicle: formData.vehicle,
      origin: formData.origin,
      destination: formData.destination,
      distance: routeData.distanceInKm,
      duration: routeData.durationInMinutes,
      routePolyline: routeData.polyline || [],
      estimatedDurationMinutes: routeData.durationInMinutes,
      estimatedFuelCost: costData?.fuelCost || 0,
      estimatedFixedCost: costData?.fixedCost || 0,
      estimatedTotalCost: costData?.totalCost || 0,
      cargo: formData.cargo ? parseFloat(formData.cargo) : 0,
      notes: formData.notes,
    };

    await onSubmit(tripData);
  };

  /**
   * Pre-fill coordinates if selected driver/vehicle has data
   */
  useEffect(() => {
    if (formData.driver && drivers.length > 0) {
      const selectedDriver = drivers.find((d) => d._id === formData.driver);
      if (selectedDriver && selectedDriver.lastLocation) {
        setFormData((prev) => ({
          ...prev,
          originLat: selectedDriver.lastLocation.lat,
          originLng: selectedDriver.lastLocation.lng,
        }));
      }
    }
  }, [formData.driver, drivers]);

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      {/* Section: Driver & Vehicle Selection */}
      <div className="trip-form-section">
        <h3>Trip Assignment</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Driver *</label>
            <select
              name="driver"
              value={formData.driver}
              onChange={handleInputChange}
              disabled={loading || routeLoading}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.licenseNumber})
                </option>
              ))}
            </select>
            {formErrors.driver && (
              <span className="form-error">{formErrors.driver}</span>
            )}
          </div>

          <div className="form-group">
            <label>Vehicle *</label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              disabled={loading || routeLoading}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
            {formErrors.vehicle && (
              <span className="form-error">{formErrors.vehicle}</span>
            )}
          </div>
        </div>
      </div>

      {/* Section: Route Details */}
      <div className="trip-form-section">
        <h3>Route Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Origin Location *</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              placeholder="e.g., Ahmedabad"
              disabled={loading || routeLoading}
            />
            {formErrors.origin && (
              <span className="form-error">{formErrors.origin}</span>
            )}
          </div>

          <div className="form-group">
            <label>Destination Location *</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="e.g., Vadodara"
              disabled={loading || routeLoading}
            />
            {formErrors.destination && (
              <span className="form-error">{formErrors.destination}</span>
            )}
          </div>
        </div>

        {/* Coordinates */}
        <div
          style={{
            padding: '0.75rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontWeight: 600,
              color: '#495057',
            }}
          >
            <input
              type="checkbox"
              checked={manualCoords}
              onChange={(e) => setManualCoords(e.target.checked)}
            />
            Enter manual coordinates
          </label>

          {manualCoords && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Origin Latitude *</label>
                  <input
                    type="number"
                    name="originLat"
                    value={formData.originLat}
                    onChange={handleInputChange}
                    placeholder="e.g., 21.1458 (Surat)"
                    step="0.0001"
                    disabled={loading || routeLoading}
                  />
                  {formErrors.originCoords && (
                    <span className="form-error">{formErrors.originCoords}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Origin Longitude *</label>
                  <input
                    type="number"
                    name="originLng"
                    value={formData.originLng}
                    onChange={handleInputChange}
                    placeholder="e.g., 72.8479 (Surat)"
                    step="0.0001"
                    disabled={loading || routeLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Destination Latitude *</label>
                  <input
                    type="number"
                    name="destinationLat"
                    value={formData.destinationLat}
                    onChange={handleInputChange}
                    placeholder="e.g., 23.2156 (Nadiad)"
                    step="0.0001"
                    disabled={loading || routeLoading}
                  />
                  {formErrors.destinationCoords && (
                    <span className="form-error">
                      {formErrors.destinationCoords}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Destination Longitude *</label>
                  <input
                    type="number"
                    name="destinationLng"
                    value={formData.destinationLng}
                    onChange={handleInputChange}
                    placeholder="e.g., 72.4519 (Nadiad)"
                    step="0.0001"
                    disabled={loading || routeLoading}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calculate Route Button */}
        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={handleCalculateRoute}
          disabled={loading || routeLoading || !manualCoords}
          title={!manualCoords ? 'Enable manual coordinates to calculate route' : ''}
        >
          {routeLoading && <span className="loading-spinner"></span>}
          {routeLoading ? 'Calculating route...' : '🗺️ Calculate Route'}
        </button>

        {!manualCoords && (
          <div
            style={{
              padding: '0.75rem',
              background: '#fff3cd',
              color: '#856404',
              borderRadius: '8px',
              marginTop: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            💡 <strong>Note:</strong> Enable "Enter manual coordinates" above and enter the latitude/longitude for both locations, then click Calculate Route to see the map.
          </div>
        )}

        {routeData && (
          <div
            style={{
              padding: '0.75rem',
              background: '#d1e7dd',
              color: '#0f5132',
              borderRadius: '8px',
              marginTop: '1rem',
              fontSize: '0.9rem',
            }}
          >
            ✓ Route calculated: {Math.round(routeData.distanceInKm)} km,{' '}
            {Math.round(routeData.durationInMinutes)} mins
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: '#f8d7da',
              color: '#842029',
              borderRadius: '8px',
              marginTop: '1rem',
              fontSize: '0.9rem',
            }}
          >
            ✗ {error}
          </div>
        )}

        {formErrors.route && (
          <span className="form-error">{formErrors.route}</span>
        )}
      </div>

      {/* Section: Vehicle Specifications */}
      <div className="trip-form-section">
        <h3>Vehicle Specifications</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Fuel Consumption (km/l)</label>
            <input
              type="number"
              name="fuelConsumption"
              value={formData.fuelConsumption}
              onChange={handleInputChange}
              placeholder="6"
              step="0.1"
              min="0.1"
              disabled={loading || routeLoading}
            />
          </div>

          <div className="form-group">
            <label>Fuel Price (₹/liter)</label>
            <input
              type="number"
              name="fuelPrice"
              value={formData.fuelPrice}
              onChange={handleInputChange}
              placeholder="100"
              step="0.1"
              min="0"
              disabled={loading || routeLoading}
            />
          </div>

          <div className="form-group">
            <label>Cost per KM (₹)</label>
            <input
              type="number"
              name="costPerKm"
              value={formData.costPerKm}
              onChange={handleInputChange}
              placeholder="5"
              step="0.1"
              min="0"
              disabled={loading || routeLoading}
            />
          </div>
        </div>
      </div>

      {/* Section: Additional Details */}
      <div className="trip-form-section">
        <h3>Cargo & Notes</h3>

        <div className="form-group">
          <label>Cargo Weight (kg)</label>
          <input
            type="number"
            name="cargo"
            value={formData.cargo}
            onChange={handleInputChange}
            placeholder="0"
            step="1"
            min="0"
            disabled={loading || routeLoading}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any special instructions or notes..."
            rows="3"
            disabled={loading || routeLoading}
          ></textarea>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-success btn-lg"
          disabled={loading || routeLoading || !routeData}
        >
          {loading && <span className="loading-spinner"></span>}
          {loading ? 'Creating trip...' : '✓ Create Trip'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
