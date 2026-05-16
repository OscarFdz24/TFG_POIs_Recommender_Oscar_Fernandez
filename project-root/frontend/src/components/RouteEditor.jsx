import { useMemo, useState } from "react";

export default function RouteEditor({
  categories,
  constraints,
  loading,
  onAddPoi,
  onConstraintChange,
  onMovePoi,
  onRemovePoi,
  onSearch,
  pois,
  route,
  t,
}) {
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    subcategory: "",
    neighborhoodZone: "",
    minRating: "",
  });

  const availableSubcategories = useMemo(() => {
    if (!filters.category) {
      return categories.flatMap((item) => item.subcategories);
    }

    return categories
      .filter((item) => item.category === filters.category)
      .flatMap((item) => item.subcategories);
  }, [categories, filters.category]);

  const routeIds = new Set(route.map((poi) => poi.id));

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  }

  function submitSearch(event) {
    event.preventDefault();
    onSearch({
      ...filters,
      limit: 80,
    });
  }

  return (
    <section className="panel route-editor-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.editor.eyebrow}</p>
          <h2>{t.editor.title}</h2>
          <p>{route.length ? t.editor.description : t.editor.empty}</p>
        </div>
      </div>

      {route.length ? (
        <>
          <div className="editor-constraints">
            <label>
              <span>{t.editor.maxPois}</span>
              <input
                min={route.length}
                onChange={(event) => onConstraintChange("maxPois", event.target.value)}
                type="number"
                value={constraints.maxPois}
              />
            </label>
            <label>
              <span>{t.editor.maxDistance}</span>
              <input
                min="1"
                onChange={(event) => onConstraintChange("maxDistanceKm", event.target.value)}
                type="number"
                value={constraints.maxDistanceKm}
              />
            </label>
            <label>
              <span>{t.editor.availableTime}</span>
              <input
                min="30"
                onChange={(event) => onConstraintChange("availableTimeMinutes", event.target.value)}
                type="number"
                value={constraints.availableTimeMinutes}
              />
            </label>
          </div>

          <div className="editor-route-list">
            {route.map((poi, index) => (
              <article className="editor-route-item" key={poi.id}>
                <span className="poi-index">{index + 1}</span>
                <div>
                  <strong>{poi.name}</strong>
                  <span>
                    {poi.category || t.common.notAvailable} · {poi.subcategory || t.common.notAvailable}
                  </span>
                </div>
                <div className="editor-route-actions">
                  <button
                    className="secondary-button"
                    disabled={index === 0}
                    onClick={() => onMovePoi(poi.id, -1)}
                    type="button"
                  >
                    {t.editor.up}
                  </button>
                  <button
                    className="secondary-button"
                    disabled={index === route.length - 1}
                    onClick={() => onMovePoi(poi.id, 1)}
                    type="button"
                  >
                    {t.editor.down}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => onRemovePoi(poi.id)}
                    type="button"
                  >
                    {t.editor.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <form className="editor-search-form" onSubmit={submitSearch}>
            <label className="catalog-query-field">
              <span>{t.editor.searchToAdd}</span>
              <input
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder={t.catalog.searchPlaceholder}
                value={filters.q}
              />
            </label>
            <label>
              <span>{t.catalog.category}</span>
              <select
                onChange={(event) => updateFilter("category", event.target.value)}
                value={filters.category}
              >
                <option value="">{t.catalog.all}</option>
                {categories.map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.catalog.subcategory}</span>
              <select
                onChange={(event) => updateFilter("subcategory", event.target.value)}
                value={filters.subcategory}
              >
                <option value="">{t.catalog.all}</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.catalog.zone}</span>
              <select
                onChange={(event) => updateFilter("neighborhoodZone", event.target.value)}
                value={filters.neighborhoodZone}
              >
                <option value="">{t.catalog.all}</option>
                {t.form.neighborhoodZoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? t.catalog.searching : t.editor.search}
            </button>
          </form>

          <div className="editor-catalog-results">
            {pois.map((poi) => {
              const alreadyInRoute = routeIds.has(poi.id);

              return (
                <article className="editor-catalog-card" key={poi.id}>
                  <div>
                    <strong>{poi.name}</strong>
                    <span>
                      {poi.category || t.common.notAvailable} · {poi.subcategory || t.common.notAvailable}
                    </span>
                  </div>
                  <button
                    className={alreadyInRoute ? "secondary-button" : "primary-button"}
                    disabled={alreadyInRoute}
                    onClick={() => onAddPoi(poi)}
                    type="button"
                  >
                    {alreadyInRoute ? t.catalog.added : t.editor.add}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
