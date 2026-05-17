import { useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "demo1234",
};

export default function CompanyUsersPanel({
  loading,
  message,
  onCreateUser,
  onRefresh,
  t,
  users,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.clientName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, users]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    await onCreateUser(form);
    setForm(EMPTY_FORM);
  }

  return (
    <section className="company-users-panel">
      <div className="panel company-users-hero">
        <div>
          <p className="eyebrow">{t.companyUsers.eyebrow}</p>
          <h2>{t.companyUsers.title}</h2>
          <p>{t.companyUsers.description}</p>
        </div>
        <button className="secondary-button" disabled={loading} onClick={onRefresh} type="button">
          {loading ? t.companyUsers.loading : t.companyUsers.refresh}
        </button>
      </div>

      {message && <div className="panel success-panel">{message}</div>}

      <div className="company-users-grid">
        <form className="panel admin-form company-user-form" onSubmit={submitForm}>
          <div>
            <p className="eyebrow">{t.companyUsers.createEyebrow}</p>
            <h3>{t.companyUsers.createTitle}</h3>
          </div>
          <label>
            <span>{t.admin.users.name}</span>
            <input
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>
          <label>
            <span>{t.admin.users.email}</span>
            <input
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            <span>{t.admin.users.password}</span>
            <input
              onChange={(event) => updateField("password", event.target.value)}
              required
              value={form.password}
            />
          </label>
          <p className="admin-help">{t.companyUsers.passwordHelp}</p>
          <button className="primary-button" disabled={loading} type="submit">
            {t.companyUsers.create}
          </button>
        </form>

        <section className="panel admin-table-card">
          <div className="admin-table-head">
            <div>
              <p className="eyebrow">{t.companyUsers.listEyebrow}</p>
              <h3>{t.companyUsers.listTitle}</h3>
            </div>
            <label className="admin-search-field">
              <span>{t.admin.search}</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.companyUsers.searchPlaceholder}
                value={search}
              />
            </label>
          </div>

          <div className="company-user-list">
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <article className="company-user-card" key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <small>{user.clientName || t.modes.company}</small>
                </article>
              ))
            ) : (
              <p className="user-routes-empty">{t.companyUsers.empty}</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
