import PreferenceForm from "./PreferenceForm.jsx";
import appLogo from "../assets/icono_web.png";

export default function AppSidebar({
  categories,
  defaultStart,
  onClose,
  onSubmit,
  submitting,
  t,
}) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-head">
        <div className="topbar-brand sidebar-brand">
          <img className="brand-logo" src={appLogo} alt="" />
          <div>
            <strong>{t.topbar.title}</strong>
          </div>
        </div>

        <button className="sidebar-icon-button" onClick={onClose} type="button">
          ×
        </button>
      </div>

      <PreferenceForm
        categoriesTree={categories}
        defaultStart={defaultStart}
        onSubmit={onSubmit}
        submitting={submitting}
        t={t}
      />
    </aside>
  );
}
