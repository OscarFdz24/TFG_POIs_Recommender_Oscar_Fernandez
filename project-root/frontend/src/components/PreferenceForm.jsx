import { useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation.js";

function getInitialForm(defaultStart) {
  return {
    latitude: String(defaultStart.lat),
    longitude: String(defaultStart.lng),
    neighborhoodZones: [],
    categories: [],
    subcategories: [],
    maxDistanceKm: "6",
    minPois: "1",
    maxPois: "6",
    availableTimeMinutes: "240",
    minRating: "4",
  };
}

export default function PreferenceForm({
  categoriesTree,
  defaultStart,
  onSubmit,
  submitting,
  t,
}) {
  const [form, setForm] = useState(() => getInitialForm(defaultStart));
  const [validationError, setValidationError] = useState("");
  const [openSections, setOpenSections] = useState({
    location: true,
    categories: false,
    subcategories: false,
    route: true,
  });
  const { error: geoError, loading: geoLoading, requestCurrentLocation } = useGeolocation();

  const availableSubcategories = !form.categories.length
    ? categoriesTree.flatMap((item) => item.subcategories)
    : categoriesTree
        .filter((item) => form.categories.includes(item.category))
        .flatMap((item) => item.subcategories);

  function handleChange(event) {
    const { name, value } = event.target;
    setValidationError("");
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleMultiSelect(event) {
    const { name, options } = event.target;
    const values = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setForm((current) => {
      const nextForm = {
        ...current,
        [name]: values,
      };

      if (name === "categories") {
        nextForm.subcategories = current.subcategories.filter((subcategory) =>
          categoriesTree
            .filter((item) => values.includes(item.category))
            .flatMap((item) => item.subcategories)
            .includes(subcategory),
        );
      }

      return nextForm;
    });
  }

  function toggleListValue(name, value) {
    setValidationError("");
    setForm((current) => {
      const currentValues = current[name] || [];
      const exists = currentValues.includes(value);
      const nextValues = exists
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      const nextForm = {
        ...current,
        [name]: nextValues,
      };

      if (name === "categories") {
        nextForm.subcategories = current.subcategories.filter((subcategory) =>
          categoriesTree
            .filter((item) => nextValues.includes(item.category))
            .flatMap((item) => item.subcategories)
            .includes(subcategory),
        );
      }

      return nextForm;
    });
  }

  function renderChipGroup(name, values, selectedValues) {
    return (
      <div className="chip-group">
        {values.map((value) => {
          const active = selectedValues.includes(value);

          return (
            <button
              className={`choice-chip ${active ? "active" : ""}`}
              key={value}
              onClick={() => toggleListValue(name, value)}
              type="button"
            >
              {value}
            </button>
          );
        })}
      </div>
    );
  }

  function toggleSection(section) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function renderSection(section, title, helper, children) {
    const isOpen = openSections[section];

    return (
      <div className={`form-section ${isOpen ? "open" : "closed"}`}>
        <button
          className="form-section-toggle"
          onClick={() => toggleSection(section)}
          type="button"
        >
          <span>
            <strong>{title}</strong>
            <small>{helper}</small>
          </span>
          <span className="accordion-indicator">{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && <div className="form-section-body">{children}</div>}
      </div>
    );
  }

  async function handleUseCurrentLocation() {
    const currentLocation = await requestCurrentLocation(t.geo);
    setForm((current) => ({
      ...current,
      latitude: String(currentLocation.lat),
      longitude: String(currentLocation.lng),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const minPois = Math.max(0, Number(form.minPois || 0));
    const maxPois = Number(form.maxPois || 1);

    if (minPois > maxPois) {
      setValidationError(t.form.minPoisError);
      return;
    }

    onSubmit({
      startLocation: {
        lat: Number(form.latitude),
        lng: Number(form.longitude),
      },
      categories: form.categories,
      subcategories: form.subcategories,
      neighborhoodZones: form.neighborhoodZones,
      maxDistanceKm: Number(form.maxDistanceKm),
      minPois,
      maxPois,
      availableTimeMinutes: Number(form.availableTimeMinutes),
      minRating: form.minRating ? Number(form.minRating) : 0,
    });
  }

  return (
    <form className="panel preference-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.form.eyebrow}</p>
          <h2>{t.form.title}</h2>
        </div>
      </div>

      <button
        className="secondary-button location-action-button"
        onClick={handleUseCurrentLocation}
        type="button"
      >
        {geoLoading ? t.form.locating : t.form.useLocation}
      </button>

      <div className="form-scroll-body">
        {renderSection("location", t.form.locationSection, t.form.locationHelp, (
          <>
          <div className="grid two-columns">
            <label>
              <span>{t.form.latitude}</span>
              <input
                name="latitude"
                onChange={handleChange}
                required
                step="0.000001"
                type="number"
                value={form.latitude}
              />
            </label>
            <label>
              <span>{t.form.longitude}</span>
              <input
                name="longitude"
                onChange={handleChange}
                required
                step="0.000001"
                type="number"
                value={form.longitude}
              />
            </label>
          </div>
          <div className="single-field compact-select-field">
            <span>{t.form.neighborhoodZones}</span>
            {renderChipGroup(
              "neighborhoodZones",
              t.form.neighborhoodZoneOptions,
              form.neighborhoodZones,
            )}
          </div>
          </>
        ))}

        {renderSection("categories", t.form.categories, t.form.categoriesHelp, (
          <div>
            {renderChipGroup(
              "categories",
              categoriesTree.map((item) => item.category),
              form.categories,
            )}
          </div>
        ))}

        {renderSection("subcategories", t.form.subcategories, t.form.subcategoriesHelp, (
          <div>
            {renderChipGroup(
              "subcategories",
              availableSubcategories,
              form.subcategories,
            )}
          </div>
        ))}

        {renderSection("route", t.form.routeSection, t.form.routeHelp, (
          <div className="grid three-columns">
            <label>
              <span>{t.form.maxDistance}</span>
              <input
                min="1"
                name="maxDistanceKm"
                onChange={handleChange}
                type="number"
                value={form.maxDistanceKm}
              />
            </label>
            <label>
              <span>{t.form.minPois}</span>
              <input
                max={form.maxPois || 12}
                min="0"
                name="minPois"
                onChange={handleChange}
                type="number"
                value={form.minPois}
              />
            </label>
            <label>
              <span>{t.form.maxPois}</span>
              <input
                max="12"
                min="1"
                name="maxPois"
                onChange={handleChange}
                type="number"
                value={form.maxPois}
              />
            </label>
            <label>
              <span>{t.form.availableTime}</span>
              <input
                min="30"
                name="availableTimeMinutes"
                onChange={handleChange}
                type="number"
                value={form.availableTimeMinutes}
              />
            </label>
            <label>
              <span>{t.form.minRating}</span>
              <input
                max="5"
                min="0"
                name="minRating"
                onChange={handleChange}
                step="0.1"
                type="number"
                value={form.minRating}
              />
            </label>
          </div>
        ))}

        {(geoError || null) && <p className="inline-error">{geoError}</p>}
        {(validationError || null) && <p className="inline-error">{validationError}</p>}
      </div>

      <div className="form-footer">
        <p>{t.form.multiSelectHelp}</p>
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? t.form.submitting : t.form.submit}
        </button>
      </div>
    </form>
  );
}
