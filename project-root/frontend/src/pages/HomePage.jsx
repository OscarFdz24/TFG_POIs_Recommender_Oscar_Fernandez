import PreferenceForm from "../components/PreferenceForm.jsx";
import ResultsSidebar from "../components/ResultsSidebar.jsx";
import RouteMap from "../components/RouteMap.jsx";
import PoiDetailPanel from "../components/PoiDetailPanel.jsx";

export default function HomePage({
  categories,
  defaultStart,
  error,
  health,
  language,
  loading,
  onLanguageChange,
  onPoiSelect,
  onRouteDisplayModeChange,
  onSubmit,
  onThemeChange,
  routeData,
  routeDisplayMode,
  selectedPoi,
  submitting,
  t,
  theme,
}) {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{t.app.eyebrow}</p>
          <h1>{t.app.title}</h1>
          <p className="hero-copy">{t.app.subtitle}</p>
        </div>

        <div className="hero-actions">
          <div className="toolbar-card">
            <div className="toggle-group">
              <span className="toggle-group-label">{t.controls.theme}</span>
              <div className="segmented-control">
                <button
                  className={`segment-button ${theme === "dark" ? "active" : ""}`}
                  onClick={() => onThemeChange("dark")}
                  type="button"
                >
                  {t.controls.themeDark}
                </button>
                <button
                  className={`segment-button ${theme === "light" ? "active" : ""}`}
                  onClick={() => onThemeChange("light")}
                  type="button"
                >
                  {t.controls.themeLight}
                </button>
              </div>
            </div>

            <div className="toggle-group">
              <span className="toggle-group-label">{t.controls.language}</span>
              <div className="segmented-control">
                <button
                  className={`segment-button ${language === "es" ? "active" : ""}`}
                  onClick={() => onLanguageChange("es")}
                  type="button"
                >
                  {t.controls.languageEs}
                </button>
                <button
                  className={`segment-button ${language === "en" ? "active" : ""}`}
                  onClick={() => onLanguageChange("en")}
                  type="button"
                >
                  {t.controls.languageEn}
                </button>
              </div>
            </div>
          </div>

          <div className="status-card">
            <span>{t.app.backend}</span>
            <strong>
              {health?.status === "ok" ? t.app.backendActive : t.app.backendOffline}
            </strong>
          </div>
        </div>
      </section>

      {loading && (
        <section className="panel">
          <p>{t.app.loading}</p>
        </section>
      )}
      {error && (
        <section className="panel error-panel">
          <p>{error}</p>
        </section>
      )}

      {!loading && (
        <>
          <section className="top-grid">
            <PreferenceForm
              categoriesTree={categories}
              defaultStart={defaultStart}
              onSubmit={onSubmit}
              submitting={submitting}
              t={t}
            />

            {routeData ? (
              <section className="panel route-overview">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{t.overview.eyebrow}</p>
                    <h2>{t.overview.title}</h2>
                  </div>
                </div>

                <div className="overview-grid">
                  <div className="overview-card">
                    <span>{t.overview.generatedPois}</span>
                    <strong>
                      {routeData.summary.totalPois} / {routeData.summary.requestedPois}
                    </strong>
                  </div>
                  <div className="overview-card">
                    <span>{t.overview.routeDistance}</span>
                    <strong>{routeData.summary.totalDistanceKm} km</strong>
                  </div>
                  <div className="overview-card">
                    <span>{t.overview.visitTime}</span>
                    <strong>{routeData.summary.totalVisitMinutes} min</strong>
                  </div>
                  <div className="overview-card">
                    <span>{t.overview.travelTime}</span>
                    <strong>
                      {routeData.summary.totalTravelMinutes === null
                        ? t.common.notAvailable
                        : `${routeData.summary.totalTravelMinutes} min`}
                    </strong>
                  </div>
                  <div className="overview-card">
                    <span>{t.overview.totalTime}</span>
                    <strong>{routeData.summary.totalExperienceMinutes} min</strong>
                  </div>
                  <div className="overview-card">
                    <span>{t.overview.routeMode}</span>
                    <strong>
                      {routeDisplayMode === "walking"
                        ? t.overview.routeModeWalking
                        : t.overview.routeModeDirect}
                    </strong>
                  </div>
                </div>
              </section>
            ) : null}
          </section>

          <section className="workspace-grid">
            <div className="workspace-main">
              <RouteMap
                onPoiSelect={onPoiSelect}
                onRouteDisplayModeChange={onRouteDisplayModeChange}
                route={routeData?.route || []}
                routeDisplayMode={routeDisplayMode}
                routeGeometry={routeData?.navigation?.geometry || []}
                selectedPoi={selectedPoi}
                startLocation={routeData?.preferences?.startLocation || defaultStart}
                t={t}
                theme={theme}
              />
              <PoiDetailPanel poi={selectedPoi} t={t} />
            </div>

            <div className="workspace-side">
              {routeData ? (
                <ResultsSidebar
                  meta={routeData.meta}
                  onPoiSelect={onPoiSelect}
                  route={routeData.route}
                  selectedPoi={selectedPoi}
                  summary={routeData.summary}
                  t={t}
                />
              ) : (
                <section className="panel empty-panel">
                  <p className="eyebrow">{t.empty.eyebrow}</p>
                  <h2>{t.empty.title}</h2>
                  <p>{t.empty.description}</p>
                </section>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
