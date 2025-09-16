// src/App.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100vw',
  height: '100vh'
};

const mapOptions = {
  disableDefaultUI: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ]
};

function App() {
  const [motels, setMotels] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMotel, setSelectedMotel] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const currentLocation = { lat: latitude, lng: longitude };
      setUserLocation(currentLocation);

      try {
        const response = await axios.get(`${API_URL}/api/motels`, {
          params: { lat: latitude, lon: longitude }
        });
        setMotels(response.data.results);
      } catch (error) {
        console.error("Error al buscar moteles:", error);
        alert("No se pudieron cargar los moteles. Intenta recargar la página.");
      }
    }, (error) => {
      console.error("Error de geolocalización:", error);
      alert("No pudimos obtener tu ubicación. Por favor, activa los permisos de ubicación en tu navegador.");
    });
  }, []);

  if (!isLoaded || !userLocation) {
    return <div className="loading-screen"><h1>ahoraiTELO</h1><p>Buscando moteles cerca tuyo...</p></div>;
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>ahoraiTELO</h1>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={14}
        options={mapOptions}
      >
        {/* Marcador para la ubicación del usuario */}
        <Marker position={userLocation} />

        {/* Mapeamos los moteles para crear un marcador para cada uno */}
        {motels.map(motel => (
          <Marker
            key={motel.place_id}
            position={motel.geometry.location}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E91E63' width='48px' height='48px'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            onClick={() => setSelectedMotel(motel)}
          />
        ))}

        {/* Muestra una ventana de información cuando se selecciona un motel */}
        {selectedMotel && (
          <InfoWindow
            position={selectedMotel.geometry.location}
            onCloseClick={() => setSelectedMotel(null)}
          >
            <div className="info-window">
              <h3>{selectedMotel.name}</h3>
              <p>{selectedMotel.vicinity}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMotel.geometry.location.lat},${selectedMotel.geometry.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default App;