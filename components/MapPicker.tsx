"use client";

import { useEffect, useRef, useState } from "react";

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  addressHint?: string; // e.g. "subcity, city, state" for geocode button
  height?: string;
}

/**
 * Interactive map picker using OpenStreetMap + Leaflet.
 * - Click anywhere on the map to place/move the marker.
 * - Drag the marker to fine-tune.
 * - "Use My Location" button uses browser geolocation.
 * - "Find on Map" button geocodes the addressHint via Nominatim.
 * SSR-safe — Leaflet is loaded only on the client side.
 */
export default function MapPicker({
  lat,
  lng,
  onChange,
  addressHint = "",
  height = "300px",
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );

  // Place / move marker helper (called both from click and geocode)
  const placeMarker = (L: any, map: any, newLat: number, newLng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    } else {
      markerRef.current = L.marker([newLat, newLng], { draggable: true })
        .addTo(map)
        .bindPopup("PG Location")
        .openPopup();

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current.getLatLng();
        const updated = { lat: +pos.lat.toFixed(6), lng: +pos.lng.toFixed(6) };
        setCoords(updated);
        onChange(updated);
      });
    }
    map.setView([newLat, newLng], 16);
    const updated = { lat: +newLat.toFixed(6), lng: +newLng.toFixed(6) };
    setCoords(updated);
    onChange(updated);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialCenter: [number, number] =
        lat && lng ? [lat, lng] : [20.5937, 78.9629]; // centre of India as default

      const map = L.map(containerRef.current!, {
        center: initialCenter,
        zoom: lat && lng ? 16 : 5,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Pre-place marker if coords already known
      if (lat && lng) {
        placeMarker(L, map, lat, lng);
      }

      // Click-to-place
      map.on("click", (e: any) => {
        placeMarker(L, map, e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseMyLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        import("leaflet").then((L) => {
          placeMarker(L, mapRef.current, pos.coords.latitude, pos.coords.longitude);
        });
      },
      () => setGeoError("Could not get your location. Please allow location access.")
    );
  };

  const handleFindOnMap = async () => {
    if (!addressHint.trim()) {
      setGeoError("Fill in the address fields first, then click Find on Map.");
      return;
    }
    setGeocoding(true);
    setGeoError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressHint)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data.length === 0) {
        setGeoError("Address not found. Try entering more details.");
      } else {
        import("leaflet").then((L) => {
          placeMarker(L, mapRef.current, parseFloat(data[0].lat), parseFloat(data[0].lon));
        });
      }
    } catch {
      setGeoError("Geocoding failed. Check your internet connection.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="px-3 py-1.5 text-xs font-medium bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
        >
          📍 Use My Location
        </button>
        <button
          type="button"
          onClick={handleFindOnMap}
          disabled={geocoding}
          className="px-3 py-1.5 text-xs font-medium bg-green-50 border border-green-300 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {geocoding ? "Searching…" : "🔍 Find on Map"}
        </button>
        {coords && (
          <span className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
            {coords.lat}, {coords.lng}
          </span>
        )}
      </div>

      {geoError && (
        <p className="text-xs text-red-600">{geoError}</p>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-300">
        <div ref={containerRef} style={{ height, width: "100%" }} />
      </div>
      <p className="text-xs text-gray-400">
        Click on the map or drag the marker to set the PG location.
      </p>
    </div>
  );
}
