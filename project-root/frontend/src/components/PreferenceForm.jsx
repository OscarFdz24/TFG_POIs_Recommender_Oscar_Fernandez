import { useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation.js";

function getInitialForm(defaultStart) {
  return {
    latitude: String(defaultStart.lat),
    longitude: String(defaultStart.lng),
    categories: [],
    subcategories: [],
    maxDistanceKm: "6",
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
}) {
  const [form, setForm] = useState(() => getInitialForm(defaultStart));
  const { error: geoError, loading: geoLoading, requestCurrentLocation } = useGeolocation();

  const availableSubcategories = !form.categories.length
    ? categoriesTree.flatMap((item) => item.subcategories)
    : categoriesTree
        .filter((item) => form.categories.includes(item.category))
        .flatMap((item) => item.subcategories);

  function handleChange(event) {
    const { name, value } = event.target;
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
    const currentLocation = await requestCurrentLocation();
    setForm((current) => ({
      ...current,
      latitude: String(currentLocation.lat),
      longitude: String(currentLocation.lng),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      startLocation: {
        lat: Number(form.latitude),
        lng: Number(form.longitude),
      },
      categories: form.categories,
      subcategories: form.subcategories,
      maxDistanceKm: Number(form.maxDistanceKm),
      maxPois: Number(form.maxPois),
      availableTimeMinutes: Number(form.availableTimeMinutes),
      minRating: form.minRating ? Number(form.minRating) : 0,
    });
  }

  return (
    <form className="panel preference-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Preferencias</p>
          <h2>Diseña una ruta turística personalizada</h2>
        </div>
        <button
          className="secondary-button"
          onClick={handleUseCurrentLocation}
          type="button"
        >
          {geoLoading ? "Ubicando..." : "Usar mi ubicación"}
        </button>
      </div>

      <div className="grid two-columns">
        <label>
          <span>Latitud inicial</span>
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
          <span>Longitud inicial</span>
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

      <div className="grid two-columns">
        <label>
          <span>Categorías de interés</span>
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
          <span>Subcategorías de interés</span>
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

      <div className="grid three-columns">
        <label>
          <span>Distancia máxima (km)</span>
          <input
            min="1"
            name="maxDistanceKm"
            onChange={handleChange}
            type="number"
            value={form.maxDistanceKm}
          />
        </label>
        <label>
          <span>Número máximo de POIs</span>
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
          <span>Tiempo disponible (min)</span>
          <input
            min="30"
            name="availableTimeMinutes"
            onChange={handleChange}
            type="number"
            value={form.availableTimeMinutes}
          />
        </label>
      </div>

      <label className="single-field">
        <span>Rating mínimo</span>
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

      {(geoError || null) && <p className="inline-error">{geoError}</p>}

      <div className="form-footer">
        <p>
          Selección múltiple disponible con <strong>Ctrl</strong> o <strong>Cmd</strong>.
        </p>
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Generando ruta..." : "Generar ruta"}
        </button>
      </div>
    </form>
  );
}
