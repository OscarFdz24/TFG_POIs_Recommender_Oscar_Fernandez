import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import { fetchCategories, fetchHealth, recommendRoute } from "./services/api.js";

const DEFAULT_START = {
  lat: 41.3874,
  lng: 2.1686,
};

export default function App() {
  const [categories, setCategories] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [routeData, setRouteData] = useState(null);

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

  async function handleSubmit(preferences) {
    setSubmitting(true);
    setError("");

    try {
      const response = await recommendRoute(preferences);
      setRouteData(response);
      setSelectedPoi(response.route[0] || null);
    } catch (requestError) {
      setError(requestError.message);
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
      loading={loading}
      onPoiSelect={setSelectedPoi}
      onSubmit={handleSubmit}
      routeData={routeData}
      selectedPoi={selectedPoi}
      submitting={submitting}
    />
  );
}
