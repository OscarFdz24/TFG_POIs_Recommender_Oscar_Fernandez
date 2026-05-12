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
  loadingSavedRoute,
  appMode,
  guestRoutes,
  onAppModeChange,
  onLanguageChange,
  onLoadSavedRoute,
  onPoiSelect,
  onRemoveGuestRoute,
  onRouteDisplayModeChange,
  onSaveGuestRoute,
  onSaveRoute,
  onSubmit,
  onThemeChange,
  routeData,
  routeDisplayMode,
  savedRouteInfo,
  selectedPoi,
  savingRoute,
  submitting,
  t,
  theme,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeCode, setRouteCode] = useState("");
  const isGuestMode = appMode === "guest";

  function submitRouteCode(event) {
    event.preventDefault();
    if (routeCode.trim()) {
      onLoadSavedRoute(routeCode.trim());
    }
  }

  return (
    <div className={`app-layout ${sidebarOpen && !isGuestMode ? "sidebar-open" : "sidebar-closed"} ${isGuestMode ? "guest-layout" : ""}`}>
      {!isGuestMode && (
        <AppSidebar
          categories={categories}
          defaultStart={defaultStart}
          onClose={() => setSidebarOpen(false)}
          onSubmit={onSubmit}
          submitting={submitting}
          t={t}
        />
      )}

      <main className="app-shell">
      <div className="mobile-topbar">
        <button
          className="mobile-menu-button"
          onClick={() => (isGuestMode ? onAppModeChange("client") : setSidebarOpen(true))}
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
        <div className="mode-toolbar">
          <div className="compact-control" aria-label={t.modes.label}>
            <button
              className={appMode === "client" ? "active" : ""}
              onClick={() => onAppModeChange("client")}
              type="button"
            >
              {t.modes.client}
            </button>
            <button
              className={appMode === "guest" ? "active" : ""}
              onClick={() => onAppModeChange("guest")}
              type="button"
            >
              {t.modes.guest}
            </button>
          </div>

          {!isGuestMode && (
            <button
              className="sidebar-toggle-button"
              onClick={() => setSidebarOpen((current) => !current)}
              type="button"
            >
              {sidebarOpen ? t.sidebar.hide : t.sidebar.show}
            </button>
          )}
        </div>

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
          {isGuestMode && (
            <section className="panel guest-loader-panel">
              <div>
                <p className="eyebrow">{t.guest.eyebrow}</p>
                <h2>{t.guest.title}</h2>
                <p>{t.guest.description}</p>
              </div>
              <form className="guest-loader-form" onSubmit={submitRouteCode}>
                <label>
                  <span>{t.guest.codeLabel}</span>
                  <input
                    onChange={(event) => setRouteCode(event.target.value)}
                    placeholder={t.guest.codePlaceholder}
                    value={routeCode}
                  />
                </label>
                <button className="primary-button" disabled={loadingSavedRoute} type="submit">
                  {loadingSavedRoute ? t.guest.loading : t.guest.load}
                </button>
              </form>
              <div className="guest-routes-wallet">
                <div className="guest-routes-wallet-head">
                  <div>
                    <p className="eyebrow">{t.guestRoutes.eyebrow}</p>
                    <h3>{t.guestRoutes.title}</h3>
                  </div>
                  {routeData?.route?.length && savedRouteInfo?.publicId ? (
                    <button className="secondary-button" onClick={onSaveGuestRoute} type="button">
                      {t.guestRoutes.saveCurrent}
                    </button>
                  ) : null}
                </div>

                {guestRoutes.length ? (
                  <div className="guest-route-list">
                    {guestRoutes.map((route) => (
                      <article className="guest-route-item" key={route.publicId}>
                        <div>
                          <strong>{route.name}</strong>
                          <span>{route.totalPois} POIs</span>
                          <code>{route.publicId}</code>
                        </div>
                        <div className="guest-route-actions">
                          <button
                            className="secondary-button"
                            disabled={loadingSavedRoute}
                            onClick={() => onLoadSavedRoute(route.publicId)}
                            type="button"
                          >
                            {t.guestRoutes.open}
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => onRemoveGuestRoute(route.publicId)}
                            type="button"
                          >
                            {t.guestRoutes.remove}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="guest-routes-empty">{t.guestRoutes.empty}</p>
                )}
              </div>
            </section>
          )}

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
                  {!isGuestMode && (
                    <div className="save-route-actions">
                      <button
                        className="primary-button"
                        disabled={savingRoute}
                        onClick={onSaveRoute}
                        type="button"
                      >
                        {savingRoute ? t.saved.saving : t.saved.save}
                      </button>
                      {savedRouteInfo?.publicId && (
                        <div className="saved-route-box">
                          <span>{t.saved.success}</span>
                          <strong>{savedRouteInfo.publicId}</strong>
                        </div>
                      )}
                    </div>
                  )}
                  {isGuestMode && savedRouteInfo?.publicId && (
                    <p className="saved-route-note">
                      {t.saved.loaded}: {savedRouteInfo.publicId}
                    </p>
                  )}
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
