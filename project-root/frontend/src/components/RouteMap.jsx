import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitRouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

function createRouteMarkerIcon(routePosition, isSelected) {
  return L.divIcon({
    className: "route-marker-wrapper",
    html: `<div class="route-marker${isSelected ? " selected" : ""}">${routePosition}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function RouteMap({
  route,
  routeGeometry,
  routeDisplayMode,
  selectedPoi,
  startLocation,
  onPoiSelect,
  onRouteDisplayModeChange,
  t,
  theme,
}) {
  const routePoints = route.map((poi) => ({
    lat: poi.latitude,
    lng: poi.longitude,
  }));

  const fallbackPolylinePoints = [
    [startLocation.lat, startLocation.lng],
    ...routePoints.map((point) => [point.lat, point.lng]),
  ];
  const displayedPolylinePoints =
    routeDisplayMode === "walking" && routeGeometry && routeGeometry.length > 1
      ? routeGeometry
      : fallbackPolylinePoints;

  const polylineStyle = useMemo(
    () => ({
      color: "#55c2ff",
      weight: 5,
      opacity: 0.92,
      lineCap: "round",
      lineJoin: "round",
      dashArray: routeDisplayMode === "walking" ? undefined : "12 10",
    }),
    [routeDisplayMode],
  );

  const tileUrl =
    theme === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.map.eyebrow}</p>
          <h2>{t.map.title}</h2>
        </div>

        <div className="toggle-group">
          <span className="toggle-group-label">{t.map.routeDisplay}</span>
          <div className="segmented-control">
            <button
              className={`segment-button ${routeDisplayMode === "walking" ? "active" : ""}`}
              onClick={() => onRouteDisplayModeChange("walking")}
              type="button"
            >
              {t.map.walking}
            </button>
            <button
              className={`segment-button ${routeDisplayMode === "direct" ? "active" : ""}`}
              onClick={() => onRouteDisplayModeChange("direct")}
              type="button"
            >
              {t.map.direct}
            </button>
          </div>
        </div>
      </div>

      <MapContainer
        center={[startLocation.lat, startLocation.lng]}
        className="map-canvas"
        zoom={13}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url={tileUrl}
        />

        <CircleMarker
          center={[startLocation.lat, startLocation.lng]}
          pathOptions={{
            color: "#97f9f9",
            fillColor: "#97f9f9",
            fillOpacity: 0.95,
            weight: 3,
          }}
          radius={10}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={1}>
            {t.map.startPoint}
          </Tooltip>
          <Popup>{t.map.startPoint}</Popup>
        </CircleMarker>

        {route.map((poi) => (
          <Marker
            eventHandlers={{
              click: () => onPoiSelect(poi),
            }}
            icon={createRouteMarkerIcon(
              poi.routePosition,
              selectedPoi?.id === poi.id,
            )}
            key={poi.id}
            position={[poi.latitude, poi.longitude]}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={1}>
              {poi.name}
            </Tooltip>
            <Popup>
              <strong>{poi.routePosition}. {poi.name}</strong>
              <br />
              {poi.category} / {poi.subcategory}
            </Popup>
          </Marker>
        ))}

        {displayedPolylinePoints.length > 1 && (
          <>
            <Polyline
              pathOptions={{
                color: "#09111f",
                weight: 10,
                opacity: 0.58,
                lineCap: "round",
                lineJoin: "round",
              }}
              positions={displayedPolylinePoints}
            />
            <Polyline pathOptions={polylineStyle} positions={displayedPolylinePoints} />
          </>
        )}
        <FitRouteBounds
          points={[
            startLocation,
            ...routePoints,
          ]}
        />
      </MapContainer>

      {selectedPoi && (
        <div className="map-selection">
          {t.map.selected}: <strong>{selectedPoi.routePosition}. {selectedPoi.name}</strong>
        </div>
      )}
    </div>
  );
}
