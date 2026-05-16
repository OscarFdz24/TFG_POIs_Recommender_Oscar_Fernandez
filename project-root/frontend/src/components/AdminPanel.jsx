import { useMemo, useState } from "react";

const EMPTY_CLIENT = {
  name: "",
  clientType: "empresa",
  contactEmail: "",
  contactPhone: "",
  notes: "",
  createCompanyUser: true,
  companyUserName: "",
  companyUserEmail: "",
  companyUserPassword: "demo1234",
};

const EMPTY_USER = {
  name: "",
  email: "",
  roleCode: "client",
  clientId: "",
  password: "demo1234",
};

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
}

export default function AdminPanel({
  adminData,
  loading,
  message,
  onCreateClient,
  onCreateUser,
  onRefresh,
  onToggleUserStatus,
  t,
}) {
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT);
  const [userForm, setUserForm] = useState(EMPTY_USER);
  const [clientSearch, setClientSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const clientOptions = useMemo(() => adminData?.clients || [], [adminData?.clients]);
  const roleOptions = useMemo(() => adminData?.roles || [], [adminData?.roles]);
  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    if (!query) {
      return clientOptions;
    }

    return clientOptions.filter((client) =>
      [client.name, client.clientType, client.contactEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clientOptions, clientSearch]);
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    const users = adminData?.users || [];

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.roleName, user.clientName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [adminData?.users, userSearch]);

  function updateClientField(name, value) {
    setClientForm((current) => ({ ...current, [name]: value }));
  }

  function updateClientPhone(value) {
    updateClientField("contactPhone", value.replace(/\D/g, "").slice(0, 9));
  }

  function updateUserField(name, value) {
    setUserForm((current) => ({ ...current, [name]: value }));
  }

  async function submitClient(event) {
    event.preventDefault();
    await onCreateClient(clientForm);
    setClientForm(EMPTY_CLIENT);
  }

  async function submitUser(event) {
    event.preventDefault();
    await onCreateUser(userForm);
    setUserForm(EMPTY_USER);
  }

  return (
    <section className="admin-panel">
      <div className="panel admin-hero">
        <div>
          <p className="eyebrow">{t.admin.eyebrow}</p>
          <h2>{t.admin.title}</h2>
          <p>{t.admin.description}</p>
        </div>
        <button className="secondary-button" disabled={loading} onClick={onRefresh} type="button">
          {loading ? t.admin.loading : t.admin.refresh}
        </button>
      </div>

      {message && <div className="panel success-panel">{message}</div>}

      <div className="admin-forms-grid">
        <form className="panel admin-form" onSubmit={submitClient}>
          <div>
            <p className="eyebrow">{t.admin.clients.eyebrow}</p>
            <h3>{t.admin.clients.createTitle}</h3>
          </div>
          <label>
            <span>{t.admin.clients.name}</span>
            <input
              onChange={(event) => {
                const nextName = event.target.value;
                setClientForm((current) => ({
                  ...current,
                  name: nextName,
                  companyUserName: current.companyUserName || nextName,
                }));
              }}
              required
              value={clientForm.name}
            />
          </label>
          <div className="form-grid two">
            <label>
              <span>{t.admin.clients.type}</span>
              <input
                onChange={(event) => updateClientField("clientType", event.target.value)}
                value={clientForm.clientType}
              />
            </label>
            <label>
              <span>{t.admin.clients.email}</span>
              <input
                onChange={(event) => {
                  const nextEmail = event.target.value;
                  setClientForm((current) => ({
                    ...current,
                    contactEmail: nextEmail,
                    companyUserEmail: current.companyUserEmail || nextEmail,
                  }));
                }}
                type="email"
                value={clientForm.contactEmail}
              />
            </label>
          </div>
          <label>
            <span>{t.admin.clients.phone}</span>
            <div className="phone-input">
              <span className="phone-prefix" aria-hidden="true">
                <span className="spain-flag" />
              </span>
              <input
                inputMode="numeric"
                maxLength="9"
                onChange={(event) => updateClientPhone(event.target.value)}
                pattern="[0-9]{9}"
                placeholder="600000000"
                value={clientForm.contactPhone}
              />
            </div>
          </label>
          <label>
            <span>{t.admin.clients.notes}</span>
            <textarea
              onChange={(event) => updateClientField("notes", event.target.value)}
              rows="3"
              value={clientForm.notes}
            />
          </label>
          <div className="admin-linked-user-box">
            <label className="checkbox-row">
              <input
                checked={clientForm.createCompanyUser}
                onChange={(event) =>
                  updateClientField("createCompanyUser", event.target.checked)
                }
                type="checkbox"
              />
              <span>{t.admin.clients.createAccessUser}</span>
            </label>
            {clientForm.createCompanyUser && (
              <div className="form-grid two">
                <label>
                  <span>{t.admin.users.name}</span>
                  <input
                    onChange={(event) =>
                      updateClientField("companyUserName", event.target.value)
                    }
                    required
                    value={clientForm.companyUserName}
                  />
                </label>
                <label>
                  <span>{t.admin.users.email}</span>
                  <input
                    onChange={(event) =>
                      updateClientField("companyUserEmail", event.target.value)
                    }
                    placeholder={clientForm.contactEmail || ""}
                    required
                    type="email"
                    value={clientForm.companyUserEmail}
                  />
                </label>
                <label>
                  <span>{t.admin.users.password}</span>
                  <input
                    onChange={(event) =>
                      updateClientField("companyUserPassword", event.target.value)
                    }
                    required
                    value={clientForm.companyUserPassword}
                  />
                </label>
              </div>
            )}
          </div>
          <button className="primary-button" disabled={loading} type="submit">
            {t.admin.clients.create}
          </button>
        </form>

        <form className="panel admin-form" onSubmit={submitUser}>
          <div>
            <p className="eyebrow">{t.admin.users.eyebrow}</p>
            <h3>{t.admin.users.createTitle}</h3>
          </div>
          <div className="form-grid two">
            <label>
              <span>{t.admin.users.name}</span>
              <input
                onChange={(event) => updateUserField("name", event.target.value)}
                required
                value={userForm.name}
              />
            </label>
            <label>
              <span>{t.admin.users.email}</span>
              <input
                onChange={(event) => updateUserField("email", event.target.value)}
                required
                type="email"
                value={userForm.email}
              />
            </label>
          </div>
          <div className="form-grid two">
            <label>
              <span>{t.admin.users.role}</span>
              <select
                onChange={(event) => updateUserField("roleCode", event.target.value)}
                value={userForm.roleCode}
              >
                {roleOptions.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.admin.users.client}</span>
              <select
                disabled={userForm.roleCode === "admin"}
                onChange={(event) => updateUserField("clientId", event.target.value)}
                required={userForm.roleCode !== "admin"}
                value={userForm.roleCode === "admin" ? "" : userForm.clientId}
              >
                <option value="">{t.admin.users.selectClient}</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>{t.admin.users.password}</span>
            <input
              onChange={(event) => updateUserField("password", event.target.value)}
              required
              value={userForm.password}
            />
          </label>
          <p className="admin-help">{t.admin.users.passwordHelp}</p>
          <button className="primary-button" disabled={loading} type="submit">
            {t.admin.users.create}
          </button>
        </form>
      </div>

      <div className="admin-tables-grid">
        <section className="panel admin-table-card">
          <div className="admin-table-head">
            <div>
              <p className="eyebrow">{t.admin.clients.eyebrow}</p>
              <h3>{t.admin.clients.listTitle}</h3>
            </div>
            <label className="admin-search-field">
              <span>{t.admin.search}</span>
              <input
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder={t.admin.clients.searchPlaceholder}
                value={clientSearch}
              />
            </label>
          </div>
          <div className="admin-table-wrap scrollable">
            <table>
              <thead>
                <tr>
                  <th>{t.admin.clients.name}</th>
                  <th>{t.admin.clients.type}</th>
                  <th>{t.admin.clients.email}</th>
                  <th>{t.admin.clients.users}</th>
                  <th>{t.admin.clients.routes}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.clientType || "-"}</td>
                    <td>{client.contactEmail || "-"}</td>
                    <td>{client.userCount}</td>
                    <td>{client.routeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel admin-table-card">
          <div className="admin-table-head">
            <div>
              <p className="eyebrow">{t.admin.users.eyebrow}</p>
              <h3>{t.admin.users.listTitle}</h3>
            </div>
            <label className="admin-search-field">
              <span>{t.admin.search}</span>
              <input
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder={t.admin.users.searchPlaceholder}
                value={userSearch}
              />
            </label>
          </div>
          <div className="admin-table-wrap scrollable">
            <table>
              <thead>
                <tr>
                  <th>{t.admin.users.name}</th>
                  <th>{t.admin.users.email}</th>
                  <th>{t.admin.users.role}</th>
                  <th>{t.admin.users.client}</th>
                  <th>{t.admin.users.status}</th>
                  <th>{t.admin.users.createdAt}</th>
                  <th>{t.admin.users.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.roleName}</td>
                    <td>{user.clientName || "-"}</td>
                    <td>
                      <span className={user.isActive ? "status-badge active" : "status-badge"}>
                        {user.isActive ? t.admin.users.active : t.admin.users.inactive}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        className="secondary-button table-action-button"
                        onClick={() => onToggleUserStatus(user.id, !user.isActive)}
                        type="button"
                      >
                        {user.isActive ? t.admin.users.disable : t.admin.users.enable}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
