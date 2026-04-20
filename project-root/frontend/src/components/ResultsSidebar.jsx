import { formatDistance, formatDuration, formatScore } from "../utils/formatters.js";
import { translateMetaNote } from "../i18n/translations.js";

export default function ResultsSidebar({
  meta,
  route,
  selectedPoi,
  onPoiSelect,
  summary,
  t,
}) {
  return (
    <aside className="panel sidebar-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.results.eyebrow}</p>
          <h2>{t.results.title}</h2>
        </div>
        <div className="summary-pill">
          {summary.totalPois} / {summary.requestedPois} POIs
        </div>
      </div>

      <div className="summary-grid">
        <div>
          <span>{t.results.distance}</span>
          <strong>{formatDistance(summary.totalDistanceKm)}</strong>
        </div>
        <div>
          <span>{t.results.visitTime}</span>
          <strong>{formatDuration(summary.totalVisitMinutes)}</strong>
        </div>
        <div>
          <span>{t.results.travelTime}</span>
          <strong>{formatDuration(summary.totalTravelMinutes)}</strong>
        </div>
        <div>
          <span>{t.results.totalRoute}</span>
          <strong>{formatDuration(summary.totalExperienceMinutes)}</strong>
        </div>
      </div>

      {route.length > 0 && (
        <div className="route-timeline">
          <p className="timeline-title">{t.results.routeSequence}</p>
          <div className="timeline-track">
            <div className="timeline-stop start">
              <span className="timeline-dot" />
              <div>
                <strong>{t.results.start}</strong>
                <p>{t.results.startDescription}</p>
              </div>
            </div>

            {route.map((poi) => (
              <button
                className={`timeline-stop ${selectedPoi?.id === poi.id ? "active" : ""}`}
                key={`timeline-${poi.id}-${poi.routePosition}`}
                onClick={() => onPoiSelect(poi)}
                type="button"
              >
                <span className="timeline-dot">{poi.routePosition}</span>
                <div>
                  <strong>{poi.name}</strong>
                  <p>{poi.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {summary.totalPois < summary.requestedPois && (
        <p className="results-note">{t.results.fewerPois}</p>
      )}

      {meta?.notes?.length ? (
        <div className="meta-notes">
          {meta.notes.map((note) => (
            <p className="results-note" key={note}>
              {translateMetaNote(note, t)}
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
              <span>{t.results.rating} {formatScore(poi.rating)}</span>
              <span>{t.results.score} {formatScore(poi.score)}</span>
              <span>{t.results.fromStart} {formatDistance(poi.distanceFromStartKm)}</span>
              <span>{t.results.visit} {formatDuration(poi.visitDuration)}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
