import { useState } from "react";
import ResultsSidebar from "../components/ResultsSidebar.jsx";
import RouteMap from "../components/RouteMap.jsx";
import AppSidebar from "../components/AppSidebar.jsx";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <AppSidebar
        categories={categories}
        defaultStart={defaultStart}
        onClose={() => setSidebarOpen(false)}
        onSubmit={onSubmit}
        submitting={submitting}
        t={t}
      />

      <main className="app-shell">
      <div className="mobile-topbar">
        <button
          className="mobile-menu-button"
          onClick={() => setSidebarOpen(true)}
          type="button"
        >
          ☰
        </button>
        <div className="mobile-brand">
          <strong>{t.topbar.title}</strong>
          <span>{t.topbar.subtitle}</span>
        </div>
        <div className="mobile-topbar-actions">
          <span className={health?.status === "ok" ? "mobile-status ok" : "mobile-status"} />
          <button
            className={theme === "dark" ? "active" : ""}
            onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            type="button"
          >
            {theme === "dark" ? t.controls.themeDarkShort : t.controls.themeLightShort}
          </button>
          <button
            onClick={() => onLanguageChange(language === "es" ? "en" : "es")}
            type="button"
          >
            {language === "es" ? t.controls.languageEs : t.controls.languageEn}
          </button>
        </div>
      </div>

      <div className="content-toolbar">
        <button
          className="sidebar-toggle-button"
          onClick={() => setSidebarOpen((current) => !current)}
          type="button"
        >
          {sidebarOpen ? t.sidebar.hide : t.sidebar.show}
        </button>

        <div className="content-toolbar-controls">
          <div className="topbar-status" title={t.app.backend}>
            <span className={health?.status === "ok" ? "status-dot ok" : "status-dot"} />
            <span>{health?.status === "ok" ? t.app.backendActive : t.app.backendOffline}</span>
          </div>

          <div className="compact-control" aria-label={t.controls.theme}>
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => onThemeChange("dark")}
              title={t.controls.themeDark}
              type="button"
            >
              {t.controls.themeDarkShort}
            </button>
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => onThemeChange("light")}
              title={t.controls.themeLight}
              type="button"
            >
              {t.controls.themeLightShort}
            </button>
          </div>

          <div className="compact-control" aria-label={t.controls.language}>
            <button
              className={language === "es" ? "active" : ""}
              onClick={() => onLanguageChange("es")}
              type="button"
            >
              {t.controls.languageEs}
            </button>
            <button
              className={language === "en" ? "active" : ""}
              onClick={() => onLanguageChange("en")}
              type="button"
            >
              {t.controls.languageEn}
            </button>
          </div>
        </div>
      </div>

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
          <section className="workspace-grid">
            <div className="workspace-main">
              {routeData ? (
                <section className="panel route-overview">
                  <div className="route-overview-heading">
                    <p className="eyebrow">{t.overview.eyebrow}</p>
                    <h2>{t.overview.title}</h2>
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
    </div>
  );
}
