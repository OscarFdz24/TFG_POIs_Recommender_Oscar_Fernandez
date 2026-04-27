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
        <button
          className="secondary-button"
          onClick={handleUseCurrentLocation}
          type="button"
        >
          {geoLoading ? t.form.locating : t.form.useLocation}
        </button>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>{t.form.locationSection}</h3>
          <p>{t.form.locationHelp}</p>
        </div>
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
        <label className="single-field compact-select-field">
          <span>{t.form.neighborhoodZones}</span>
          <select
            multiple
            name="neighborhoodZones"
            onChange={handleMultiSelect}
            value={form.neighborhoodZones}
          >
            {t.form.neighborhoodZoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>{t.form.poiSection}</h3>
          <p>{t.form.poiHelp}</p>
        </div>
        <div className="grid two-columns">
          <label>
            <span>{t.form.categories}</span>
            <select
              multiple
              name="categories"
              onChange={handleMultiSelect}
              value={form.categories}
            >
              {categoriesTree.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>{t.form.subcategories}</span>
            <select
              multiple
              name="subcategories"
              onChange={handleMultiSelect}
              value={form.subcategories}
            >
              {availableSubcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>{t.form.routeSection}</h3>
          <p>{t.form.routeHelp}</p>
        </div>
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
      </div>

      {(geoError || null) && <p className="inline-error">{geoError}</p>}
      {(validationError || null) && <p className="inline-error">{validationError}</p>}

      <div className="form-footer">
        <p>{t.form.multiSelectHelp}</p>
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? t.form.submitting : t.form.submit}
        </button>
      </div>
    </form>
  );
}
