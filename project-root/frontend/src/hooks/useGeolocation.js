import { useState } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function requestCurrentLocation() {
    setError("");

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Tu navegador no soporta geolocalización.";
        setError(message);
        reject(new Error(message));
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
          });
        },
        () => {
          setLoading(false);
          const message = "No se pudo obtener tu ubicación actual.";
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      );
    });
  }

  return {
    loading,
    error,
    requestCurrentLocation,
  };
}
