import { formatDistance, formatDuration, formatScore } from "../utils/formatters.js";

export default function PoiDetailPanel({ poi }) {
  return (
    <section className="panel detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Detalle</p>
          <h2>{poi ? poi.name : "Selecciona un POI"}</h2>
        </div>
      </div>

      {!poi && <p>Haz clic en un marcador o en un resultado para inspeccionar la ficha completa.</p>}

      {poi && (
        <div className="detail-content">
          <p className="detail-description">{poi.description}</p>
          <div className="detail-grid">
            <div><span>Ruta</span><strong>{poi.routePosition}</strong></div>
            <div><span>Categoría</span><strong>{poi.category}</strong></div>
            <div><span>Subcategoría</span><strong>{poi.subcategory}</strong></div>
            <div><span>Rating</span><strong>{formatScore(poi.rating)}</strong></div>
            <div><span>Score</span><strong>{formatScore(poi.score)}</strong></div>
            <div><span>Visita</span><strong>{formatDuration(poi.visitDuration)}</strong></div>
            <div><span>Desde inicio</span><strong>{formatDistance(poi.distanceFromStartKm)}</strong></div>
            <div><span>Desde anterior</span><strong>{formatDistance(poi.distanceFromPreviousKm)}</strong></div>
            <div><span>Coordenadas</span><strong>{poi.latitude}, {poi.longitude}</strong></div>
            <div><span>Cluster</span><strong>{poi.clusterGeo ?? "N/A"}</strong></div>
            <div><span>Confidence</span><strong>{formatScore(poi.matchConfidence)}</strong></div>
            <div><span>Etiquetas</span><strong>{poi.tags || "N/A"}</strong></div>
          </div>
        </div>
      )}
    </section>
  );
}
