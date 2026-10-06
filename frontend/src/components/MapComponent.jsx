import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle clicks on the map to select a location
const LocationSelector = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Component to dynamically change map view
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapComponent = ({ 
  issues = [], 
  center = [20.5937, 78.9629], // Default center (India)
  zoom = 5, 
  interactive = false, 
  onLocationSelect, 
  selectedLocation,
  height = '400px'
}) => {
  
  // Custom icon based on severity or priority
  const getIcon = (priorityLevel) => {
    let color = '#3b82f6'; // Default Blue
    if (priorityLevel === 'High') color = '#ef4444'; // Red
    if (priorityLevel === 'Critical') color = '#b91c1c'; // Dark Red
    if (priorityLevel === 'Medium') color = '#f59e0b'; // Amber

    const markerHtmlStyles = `
      background-color: ${color};
      width: 2rem;
      height: 2rem;
      display: block;
      left: -1rem;
      top: -1rem;
      position: relative;
      border-radius: 3rem 3rem 0;
      transform: rotate(45deg);
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    return L.divIcon({
      className: "custom-pin",
      iconAnchor: [0, 24],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStyles}" />`
    });
  };

  return (
    <div style={{ height, width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {interactive && <LocationSelector setLocation={onLocationSelect} />}
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}

        {issues.map(issue => (
          <Marker 
            key={issue._id} 
            position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
            icon={getIcon(issue.priorityLevel)}
          >
            <Popup>
              <div style={{ padding: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>{issue.title}</h4>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}><strong>Category:</strong> {issue.category}</p>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}><strong>Status:</strong> {issue.status}</p>
                <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Priority: {issue.priorityLevel}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
