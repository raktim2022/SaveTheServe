'use client';

import { useState, useEffect, useRef } from 'react';
import Loader from '@/components/common/Loader';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  borderRadius: '16px'
};

export default function TrackingMap({
  volunteerCoords,
  restaurantCoords,
  ngoCoords,
  restaurantName = 'Restaurant',
  ngoName = 'NGO',
  isPickedUp = false
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [etaText, setEtaText] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({ volunteer: null, restaurant: null, ngo: null });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Inject Mapbox GL JS and CSS dynamically
  useEffect(() => {
    if (window.mapboxgl) {
      setMapLoaded(true);
      return;
    }

    // Add Mapbox CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add Mapbox JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up injected elements if necessary
    };
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    window.mapboxgl.accessToken = mapboxToken;
    const mapInstance = new window.mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: volunteerCoords ? [volunteerCoords.lng, volunteerCoords.lat] : (restaurantCoords ? [restaurantCoords.lng, restaurantCoords.lat] : [88.3639, 22.5726]),
      zoom: 14
    });

    mapInstance.on('load', () => {
      mapRef.current = mapInstance;
      setLoading(false);
    });

    // Fallback: If map loading hangs, force loading state to false
    const timeout = setTimeout(() => {
      mapRef.current = mapInstance;
      setLoading(false);
    }, 1500);

    // Solve map canvas sizing issue inside standard React modals
    const resizeTimeout = setTimeout(() => {
      mapInstance.resize();
    }, 300);

    return () => {
      clearTimeout(timeout);
      clearTimeout(resizeTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Handle markers and route updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !restaurantCoords || !ngoCoords) return;

    const mapboxgl = window.mapboxgl;

    // 1. Update/Add Restaurant Marker
    if (!markersRef.current.restaurant) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = '100%';

      markersRef.current.restaurant = new mapboxgl.Marker({ color: '#f59e0b' })
        .setLngLat([restaurantCoords.lng, restaurantCoords.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>🏪 ${restaurantName}</h3><p>Pickup Location</p>`))
        .addTo(map);
    } else {
      markersRef.current.restaurant.setLngLat([restaurantCoords.lng, restaurantCoords.lat]);
    }

    // 2. Update/Add NGO Marker
    if (!markersRef.current.ngo) {
      markersRef.current.ngo = new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([ngoCoords.lng, ngoCoords.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>🏢 ${ngoName}</h3><p>Destination NGO</p>`))
        .addTo(map);
    } else {
      markersRef.current.ngo.setLngLat([ngoCoords.lng, ngoCoords.lat]);
    }

    // 3. Update/Add Volunteer Marker
    const currentVolunteerPos = volunteerCoords || (isPickedUp ? restaurantCoords : null);
    if (currentVolunteerPos) {
      if (!markersRef.current.volunteer) {
        markersRef.current.volunteer = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([currentVolunteerPos.lng, currentVolunteerPos.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>🛵 Active Volunteer</h3><p>Live Location</p>'))
          .addTo(map);
      } else {
        markersRef.current.volunteer.setLngLat([currentVolunteerPos.lng, currentVolunteerPos.lat]);
      }
    }

    // 4. Fetch and draw Directions Route
    const origin = currentVolunteerPos;
    const destination = isPickedUp ? ngoCoords : restaurantCoords;

    if (origin && destination) {
      const getRoute = async () => {
        try {
          const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?steps=true&geometries=geojson&access_token=${mapboxToken}`
          );
          const json = await query.json();
          if (!json.routes || json.routes.length === 0) return;

          const data = json.routes[0];
          const route = data.geometry.coordinates;

          setEtaText(`${Math.round(data.duration / 60)} mins`);
          setDistanceText(`${(data.distance / 1000).toFixed(1)} km`);

          const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          };

          if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
          } else {
            map.addSource('route', {
              type: 'geojson',
              data: geojson
            });
            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
          }

          // Adjust map bounds to show route
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([origin.lng, origin.lat]);
          bounds.extend([destination.lng, destination.lat]);
          map.fitBounds(bounds, { padding: 50, maxZoom: 16 });

        } catch (error) {
          console.error('Error fetching Mapbox directions:', error);
        }
      };

      getRoute();
    }
  }, [mapLoaded, volunteerCoords, restaurantCoords, ngoCoords, isPickedUp]);

  if (!mapLoaded || loading) return <Loader text="Initializing Mapbox Tracking..." />;

  return (
    <div className="space-y-4">
      {/* Map header showing live status */}
      <div className="flex flex-wrap items-center justify-between bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-4 rounded-xl gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isPickedUp ? '🚚 Volunteer delivering to NGO' : '🛵 Volunteer heading to Restaurant'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Real-time GPS updates from active volunteer
          </p>
        </div>
        {etaText && (
          <div className="text-right">
            <span className="text-sm font-bold text-blue-600 block">ETA: {etaText}</span>
            <span className="text-xs text-gray-500">Distance: {distanceText}</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div ref={mapContainerRef} style={MAP_CONTAINER_STYLE} />
      </div>
    </div>
  );
}
