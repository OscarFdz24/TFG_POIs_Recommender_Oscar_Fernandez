import PreferenceForm from "./PreferenceForm.jsx";

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
          <span className="brand-mark">BCN</span>
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
