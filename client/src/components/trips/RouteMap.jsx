import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Route Map Component
 * Displays origin, destination, and polyline route
 */
const RouteMap = ({ origin, destination, polyline, loading = false }) => {
  const [mapKey, setMapKey] = useState(0);

  // Component to handle map fitting
  const MapFitter = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
      if (coords && coords.length > 0) {
        try {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      }
    }, [coords, map]);

    return null;
  };

  // Calculate center point
  const getCenter = () => {
    if (origin && destination) {
      return [
        (origin.lat + destination.lat) / 2,
        (origin.lng + destination.lng) / 2,
      ];
    }
    return [22.5726, 75.8631]; // Default: India center
  };

  // Extract coordinates for bounds fitting (normalize incoming data)
  const getBoundsCoords = () => {
    const coords = [];
    if (origin) coords.push([origin.lat, origin.lng]);
    if (destination) coords.push([destination.lat, destination.lng]);
    if (polyline && Array.isArray(polyline)) {
      coords.push(
        ...polyline.map((point) => {
          // point can be object {lat,lng} or array [lng,lat]
          if (Array.isArray(point)) {
            return [point[1], point[0]];
          }
          return [point.lat, point.lng];
        })
      );
    }
    return coords.length > 0 ? coords : null;
  };

  // Format display label
  const formatLabel = (label) => {
    return label || 'Point';
  };

  const hasRoute = origin && destination;

  return (
    <div className="route-map-container">
      {loading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Calculating route...
          </p>
        </div>
      )}

      {hasRoute && (
        <MapContainer
          key={mapKey}
          center={getCenter()}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Origin Marker */}
          {origin && (
            <Marker
              position={[origin.lat, origin.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <div>
                  <p>
                    <strong>Origin</strong>
                  </p>
                  <p>
                    Lat: {origin.lat.toFixed(4)}
                    <br />
                    Lng: {origin.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <div>
                  <p>
                    <strong>Destination</strong>
                  </p>
                  <p>
                    Lat: {destination.lat.toFixed(4)}
                    <br />
                    Lng: {destination.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {polyline && Array.isArray(polyline) && polyline.length > 0 && (
            <Polyline
              positions={polyline.map((point) => [point.lat, point.lng])}
              color="#007bff"
              weight={3}
              opacity={0.8}
              dashArray="5, 5"
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Fit bounds to show all markers */}
          <MapFitter coords={getBoundsCoords()} />
        </MapContainer>
      )}

      {!hasRoute && !loading && (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '1rem',
        }}>
          <p>Enter origin and destination to view map</p>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
