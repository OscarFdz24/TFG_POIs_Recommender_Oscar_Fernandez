import { formatDistance, formatDuration, formatScore } from "../utils/formatters.js";

export default function ResultsSidebar({ meta, route, selectedPoi, onPoiSelect, summary }) {
  return (
    <aside className="panel sidebar-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Resultados</p>
          <h2>POIs recomendados</h2>
        </div>
        <div className="summary-pill">
          {summary.totalPois} / {summary.requestedPois} POIs
        </div>
      </div>

      <div className="summary-grid">
        <div>
          <span>Distancia</span>
          <strong>{formatDistance(summary.totalDistanceKm)}</strong>
        </div>
        <div>
          <span>Tiempo visita</span>
          <strong>{formatDuration(summary.totalVisitMinutes)}</strong>
        </div>
      </div>

      {summary.totalPois < summary.requestedPois && (
        <p className="results-note">
          La ruta devuelve menos POIs de los pedidos porque con los filtros actuales no caben
          más candidatos razonables.
        </p>
      )}

      {meta?.notes?.length ? (
        <div className="meta-notes">
          {meta.notes.map((note) => (
            <p className="results-note" key={note}>
              {note}
            </p>
          ))}
        </div>
      ) : null}

      <div className="poi-list">
        {route.map((poi) => (
          <button
            className={`poi-card ${selectedPoi?.id === poi.id ? "active" : ""}`}
            key={`${poi.id}-${poi.routePosition}`}
            onClick={() => onPoiSelect(poi)}
            type="button"
          >
            <div className="poi-card-top">
              <span className="poi-index">{poi.routePosition}</span>
              <div>
                <h3>{poi.name}</h3>
                <p>{poi.category} · {poi.subcategory}</p>
              </div>
            </div>
            <p className="poi-description">{poi.description}</p>
            <div className="poi-metrics">
              <span>Rating {formatScore(poi.rating)}</span>
              <span>Score {formatScore(poi.score)}</span>
              <span>Inicio {formatDistance(poi.distanceFromStartKm)}</span>
              <span>Visita {formatDuration(poi.visitDuration)}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
