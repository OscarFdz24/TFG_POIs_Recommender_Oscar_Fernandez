import appLogo from "../assets/icono_web.png";

export default function AppTopbar({
  health,
  language,
  onLanguageChange,
  onThemeChange,
  t,
  theme,
}) {
  return (
    <header className="app-topbar">
      <div className="topbar-brand">
        <img className="brand-logo" src={appLogo} alt="" />
        <div>
          <strong>{t.topbar.title}</strong>
          <span>{t.topbar.subtitle}</span>
        </div>
      </div>

      <div className="topbar-controls">
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
    </header>
  );
}
