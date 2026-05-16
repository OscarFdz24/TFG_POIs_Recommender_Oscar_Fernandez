import { useMemo, useState } from "react";

export default function PoiCatalog({
  categories,
  loading,
  onAddPoi,
  onBuildRoute,
  onRemovePoi,
  onSearch,
  pois,
  selectedPois,
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

  const selectedIds = new Set(selectedPois.map((poi) => poi.id));

  return (
    <section className="panel poi-catalog-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.catalog.eyebrow}</p>
          <h2>{t.catalog.title}</h2>
        </div>
      </div>

      <form className="catalog-search-form" onSubmit={submitSearch}>
        <label className="catalog-query-field">
          <span>{t.catalog.search}</span>
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
        <label>
          <span>{t.catalog.minRating}</span>
          <input
            max="5"
            min="0"
            onChange={(event) => updateFilter("minRating", event.target.value)}
            step="0.1"
            type="number"
            value={filters.minRating}
          />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? t.catalog.searching : t.catalog.searchButton}
        </button>
      </form>

      <div className="manual-route-builder">
        <div>
          <h3>{t.catalog.manualRoute}</h3>
          <p>{t.catalog.manualRouteHelp}</p>
        </div>
        <button
          className="primary-button"
          disabled={!selectedPois.length}
          onClick={onBuildRoute}
          type="button"
        >
          {t.catalog.buildManualRoute}
        </button>
      </div>

      {selectedPois.length ? (
        <div className="selected-poi-strip">
          {selectedPois.map((poi, index) => (
            <button
              className="selected-poi-chip"
              key={poi.id}
              onClick={() => onRemovePoi(poi.id)}
              type="button"
            >
              <strong>{index + 1}</strong>
              <span>{poi.name}</span>
              <em>×</em>
            </button>
          ))}
        </div>
      ) : null}

      <div className="catalog-results">
        {pois.map((poi) => {
          const selected = selectedIds.has(poi.id);

          return (
            <article className="catalog-poi-card" key={poi.id}>
              <div>
                <strong>{poi.name}</strong>
                <span>
                  {poi.category || t.common.notAvailable} · {poi.subcategory || t.common.notAvailable}
                </span>
                <p>{poi.description}</p>
              </div>
              <div className="catalog-poi-meta">
                <span>{poi.neighborhoodZone || t.common.notAvailable}</span>
                <span>Rating {poi.rating ?? t.common.notAvailable}</span>
              </div>
              <button
                className={selected ? "secondary-button" : "primary-button"}
                disabled={selected}
                onClick={() => onAddPoi(poi)}
                type="button"
              >
                {selected ? t.catalog.added : t.catalog.add}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
