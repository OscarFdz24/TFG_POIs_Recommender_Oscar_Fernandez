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

export default function RouteMap({ route, selectedPoi, startLocation, onPoiSelect }) {
  const routePoints = route.map((poi) => ({
    lat: poi.latitude,
    lng: poi.longitude,
  }));

  const polylinePoints = [
    [startLocation.lat, startLocation.lng],
    ...routePoints.map((point) => [point.lat, point.lng]),
  ];

  const polylineStyle = useMemo(
    () => ({
      color: "#55c2ff",
      weight: 5,
      opacity: 0.92,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "12 10",
    }),
    [],
  );

  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Mapa</p>
          <h2>Ruta interactiva</h2>
        </div>
      </div>

      <MapContainer
        center={[startLocation.lat, startLocation.lng]}
        className="map-canvas"
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            Punto inicial
          </Tooltip>
          <Popup>Punto inicial</Popup>
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

        {polylinePoints.length > 1 && (
          <>
            <Polyline
              pathOptions={{
                color: "#09111f",
                weight: 10,
                opacity: 0.58,
                lineCap: "round",
                lineJoin: "round",
              }}
              positions={polylinePoints}
            />
            <Polyline pathOptions={polylineStyle} positions={polylinePoints} />
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
          Seleccionado: <strong>{selectedPoi.routePosition}. {selectedPoi.name}</strong>
        </div>
      )}
    </div>
  );
}
