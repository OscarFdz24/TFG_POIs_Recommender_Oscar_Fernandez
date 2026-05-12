import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import {
  fetchCategories,
  fetchHealth,
  fetchSavedRoute,
  fetchStreetRoute,
  recommendRoute,
  saveRoute,
} from "./services/api.js";
import { translations } from "./i18n/translations.js";

const DEFAULT_START = {
  lat: 41.3874,
  lng: 2.1686,
};

const GUEST_ROUTES_STORAGE_KEY = "guest-saved-routes";

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

function getInitialGuestRoutes() {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_ROUTES_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [savedRouteInfo, setSavedRouteInfo] = useState(null);
  const [savingRoute, setSavingRoute] = useState(false);
  const [loadingSavedRoute, setLoadingSavedRoute] = useState(false);
  const [appMode, setAppMode] = useState("client");
  const [guestRoutes, setGuestRoutes] = useState(getInitialGuestRoutes);
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
    window.localStorage.setItem(GUEST_ROUTES_STORAGE_KEY, JSON.stringify(guestRoutes));
  }, [guestRoutes]);

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
      setSavedRouteInfo(null);
      setSelectedPoi(enrichedResponse.route[0] || null);
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError.message, t));
      setRouteData(null);
      setSelectedPoi(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveRoute() {
    if (!routeData?.route?.length) {
      setError(t.saved.noRouteToSave);
      return;
    }

    setSavingRoute(true);
    setError("");

    try {
      const saved = await saveRoute({
        name: `${t.saved.defaultRouteName} ${new Date().toLocaleString()}`,
        recommendation: routeData,
        navigation: routeData.navigation || null,
      });
      setSavedRouteInfo(saved);
    } catch (requestError) {
      setError(requestError.message || t.saved.saveError);
    } finally {
      setSavingRoute(false);
    }
  }

  async function handleLoadSavedRoute(publicId) {
    setLoadingSavedRoute(true);
    setError("");
    setSavedRouteInfo(null);

    try {
      const saved = await fetchSavedRoute(publicId);
      const recommendation = saved.recommendation || {};
      const savedSummary = saved.summary || recommendation.summary || {};
      const totalVisitMinutes = savedSummary.totalVisitMinutes ?? saved.totalVisitMinutes ?? 0;
      const totalTravelMinutes = savedSummary.totalTravelMinutes ?? saved.totalTravelMinutes ?? null;
      const loadedRoute = {
        ...recommendation,
        name: saved.name,
        navigation: saved.navigation || recommendation.navigation || null,
        summary: {
          ...savedSummary,
          totalTravelMinutes,
          totalExperienceMinutes:
            savedSummary.totalExperienceMinutes ??
            saved.totalExperienceMinutes ??
            (totalTravelMinutes === null
              ? totalVisitMinutes
              : Number(totalVisitMinutes) + Number(totalTravelMinutes)),
        },
        meta: saved.meta || recommendation.meta || {},
        preferences: saved.preferences || recommendation.preferences || {},
        route: recommendation.route || saved.pois?.map((poi) => poi.poiData || poi) || [],
      };

      setRouteData(loadedRoute);
      setSelectedPoi(loadedRoute.route[0] || null);
      setSavedRouteInfo({
        publicId: saved.publicId,
        routeId: saved.id,
        totalPois: saved.totalPois,
        message: t.saved.loaded,
      });
      setAppMode("guest");
    } catch (requestError) {
      setError(requestError.message || t.saved.loadError);
      setRouteData(null);
      setSelectedPoi(null);
    } finally {
      setLoadingSavedRoute(false);
    }
  }

  function handleSaveGuestRoute() {
    if (!routeData?.route?.length || !savedRouteInfo?.publicId) {
      setError(t.guestRoutes.noLoadedRoute);
      return;
    }

    const routeName = routeData.name || `${t.guestRoutes.defaultName} ${guestRoutes.length + 1}`;
    const newItem = {
      publicId: savedRouteInfo.publicId,
      name: routeName,
      totalPois: routeData.summary?.totalPois || routeData.route.length,
      savedAt: new Date().toISOString(),
    };

    setGuestRoutes((currentRoutes) => {
      const withoutDuplicate = currentRoutes.filter(
        (route) => route.publicId !== newItem.publicId,
      );
      return [newItem, ...withoutDuplicate].slice(0, 12);
    });
  }

  function handleRemoveGuestRoute(publicId) {
    setGuestRoutes((currentRoutes) =>
      currentRoutes.filter((route) => route.publicId !== publicId),
    );
  }

  return (
    <HomePage
      categories={categories}
      defaultStart={DEFAULT_START}
      error={error}
      health={health}
      language={language}
      loading={loading}
      loadingSavedRoute={loadingSavedRoute}
      appMode={appMode}
      onAppModeChange={setAppMode}
      onLanguageChange={setLanguage}
      onLoadSavedRoute={handleLoadSavedRoute}
      onPoiSelect={setSelectedPoi}
      onRemoveGuestRoute={handleRemoveGuestRoute}
      onRouteDisplayModeChange={setRouteDisplayMode}
      onSaveGuestRoute={handleSaveGuestRoute}
      onSaveRoute={handleSaveRoute}
      onSubmit={handleSubmit}
      onThemeChange={setTheme}
      routeData={routeData}
      routeDisplayMode={routeDisplayMode}
      guestRoutes={guestRoutes}
      savedRouteInfo={savedRouteInfo}
      selectedPoi={selectedPoi}
      savingRoute={savingRoute}
      submitting={submitting}
      t={t}
      theme={theme}
    />
  );
}
