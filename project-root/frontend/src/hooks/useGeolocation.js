import { useState } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function requestCurrentLocation(messages) {
    setError("");

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = messages?.unsupported || "Geolocation is not supported.";
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
          const message = messages?.unavailable || "Could not get current location.";
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
