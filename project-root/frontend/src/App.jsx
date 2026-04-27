import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import {
  fetchCategories,
  fetchHealth,
  fetchStreetRoute,
  recommendRoute,
} from "./services/api.js";
import { translations } from "./i18n/translations.js";

const DEFAULT_START = {
  lat: 41.3874,
  lng: 2.1686,
};

function getFriendlyErrorMessage(message, t) {
  if (message === "MIN_POIS_NOT_REACHED") {
    return t.errors.minPoisNotReached;
  }

  if (message === "MIN_POIS_GREATER_THAN_MAX_POIS") {
    return t.errors.minPoisGreaterThanMax;
  }

  if (message === "Invalid start location.") {
    return t.errors.invalidLocation;
  }

  if (/Failed to fetch|NetworkError|fetch/i.test(message || "")) {
    return t.errors.network;
  }

  return t.errors.generic;
}

function getInitialPreference(key, fallback) {
  return window.localStorage.getItem(key) || fallback;
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [theme, setTheme] = useState(() => getInitialPreference("app-theme", "dark"));
  const [language, setLanguage] = useState(() =>
    getInitialPreference("app-language", "es"),
  );
  const [routeDisplayMode, setRouteDisplayMode] = useState("walking");

  const t = translations[language] || translations.es;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = t.languageCode;
    window.localStorage.setItem("app-language", language);
  }, [language, t.languageCode]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [healthResponse, categoriesResponse] = await Promise.all([
          fetchHealth(),
          fetchCategories(),
        ]);
        setHealth(healthResponse);
        setCategories(categoriesResponse.items);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  function buildWaypoints(response) {
    return [
      response.preferences.startLocation,
      ...response.route.map((poi) => ({
        lat: poi.latitude,
        lng: poi.longitude,
      })),
    ];
  }

  async function handleSubmit(preferences) {
    setSubmitting(true);
    setError("");

    try {
      const response = await recommendRoute(preferences);
      const requestedMinimum = Number(preferences.minPois || 0);

      if (requestedMinimum > 0 && response.summary.totalPois < requestedMinimum) {
        throw new Error("MIN_POIS_NOT_REACHED");
      }

      let enrichedResponse = {
        ...response,
        summary: {
          ...response.summary,
          totalTravelMinutes: null,
          totalExperienceMinutes: response.summary.totalVisitMinutes,
        },
      };

      if (response.route.length > 0) {
        const waypoints = buildWaypoints(response);

        try {
          const streetRoute = await fetchStreetRoute(waypoints);

          enrichedResponse = {
            ...response,
            navigation: streetRoute,
            summary: {
              ...response.summary,
              totalDistanceKm: streetRoute.distanceKm,
              totalTravelMinutes: streetRoute.durationMinutes,
              totalExperienceMinutes:
                response.summary.totalVisitMinutes + streetRoute.durationMinutes,
            },
            meta: {
              ...response.meta,
              notes: [
                "La distancia y el trazado del mapa se calculan sobre red viaria peatonal.",
                ...(response.meta?.notes || []),
              ],
            },
          };
        } catch {
          enrichedResponse = {
            ...response,
            navigation: {
              geometry: waypoints.map((point) => [point.lat, point.lng]),
              mode: "straight-line-fallback",
            },
            summary: {
              ...response.summary,
              totalTravelMinutes: null,
              totalExperienceMinutes: response.summary.totalVisitMinutes,
            },
            meta: {
              ...response.meta,
              notes: [
                "No se pudo recuperar la ruta callejeando y se muestra trazado directo como respaldo.",
                ...(response.meta?.notes || []),
              ],
            },
          };
        }
      }

      setRouteData(enrichedResponse);
      setSelectedPoi(enrichedResponse.route[0] || null);
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError.message, t));
      setRouteData(null);
      setSelectedPoi(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <HomePage
      categories={categories}
      defaultStart={DEFAULT_START}
      error={error}
      health={health}
      language={language}
      loading={loading}
      onLanguageChange={setLanguage}
      onPoiSelect={setSelectedPoi}
      onRouteDisplayModeChange={setRouteDisplayMode}
      onSubmit={handleSubmit}
      onThemeChange={setTheme}
      routeData={routeData}
      routeDisplayMode={routeDisplayMode}
      selectedPoi={selectedPoi}
      submitting={submitting}
      t={t}
      theme={theme}
    />
  );
}
