import PreferenceForm from "../components/PreferenceForm.jsx";
import ResultsSidebar from "../components/ResultsSidebar.jsx";
import RouteMap from "../components/RouteMap.jsx";
import PoiDetailPanel from "../components/PoiDetailPanel.jsx";

export default function HomePage({
  categories,
  defaultStart,
  error,
  health,
  loading,
  onPoiSelect,
  onSubmit,
  routeData,
  selectedPoi,
  submitting,
}) {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">TFG · Recomendación de rutas</p>
          <h1>Planificador inteligente de POIs en Barcelona</h1>
          <p className="hero-copy">
            Interfaz preparada para conectar la futura lógica híbrida del recomendador:
            preferencias del usuario, ranking, proximidad geográfica y rutas optimizadas.
          </p>
        </div>
        <div className="status-card">
          <span>Backend</span>
          <strong>{health?.status === "ok" ? "Activo" : "Sin conexión"}</strong>
        </div>
      </section>

      {loading && <section className="panel"><p>Cargando catálogo de categorías y estado del backend...</p></section>}
      {error && <section className="panel error-panel"><p>{error}</p></section>}

      {!loading && (
        <>
          <PreferenceForm
            categoriesTree={categories}
            defaultStart={defaultStart}
            onSubmit={onSubmit}
            submitting={submitting}
          />

          <section className="workspace-grid">
            <div className="workspace-main">
              <RouteMap
                onPoiSelect={onPoiSelect}
                route={routeData?.route || []}
                selectedPoi={selectedPoi}
                startLocation={routeData?.preferences?.startLocation || defaultStart}
              />
              <PoiDetailPanel poi={selectedPoi} />
            </div>

            <div className="workspace-side">
              {routeData ? (
                <ResultsSidebar
                  meta={routeData.meta}
                  onPoiSelect={onPoiSelect}
                  route={routeData.route}
                  selectedPoi={selectedPoi}
                  summary={routeData.summary}
                />
              ) : (
                <section className="panel empty-panel">
                  <p className="eyebrow">Resultados</p>
                  <h2>Tu ruta aparecerá aquí</h2>
                  <p>
                    Introduce preferencias, genera una ruta y podrás explorar los POIs
                    sobre mapa, orden de recorrido y detalle ampliado.
                  </p>
                </section>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
