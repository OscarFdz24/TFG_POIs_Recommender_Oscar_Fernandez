# Barcelona POIs Recommender Web

Aplicación web full-stack para el TFG con una primera versión funcional de extremo a extremo:

- `backend/`: API Node.js + Express sobre el dataset procesado real.
- `frontend/`: cliente React + Vite con formulario, mapa Leaflet, lista y detalle.
- `app/`, `config/`, `tests/`: estructura Python previa, conservada sin tocar para no romper trabajo existente.

## Arquitectura

### Backend

- `GET /api/health`: estado del servicio.
- `GET /api/pois`: catálogo de POIs con filtros básicos.
- `GET /api/categories`: categorías y subcategorías para el formulario.
- `POST /api/recommend-route`: recomendación temporal basada en filtros, ranking heurístico y orden greedy por cercanía.

La lógica actual está preparada como capa transitoria para que más adelante puedas:

- invocar notebooks o scripts Python procesados,
- sustituir el motor heurístico por uno híbrido,
- mantener la misma API hacia el frontend.

### Fuente de datos

El backend reutiliza el CSV ya existente en:

- `../data/pois_barcelona_procesados.csv`

Si en el futuro exportas un dataset enriquecido con `cluster_geo` u otras columnas, la API ya intenta leerlas cuando existan.

## Ejecución local

### 1. Backend

```bash
cd project-root/backend
cp .env.example .env
npm install
npm run dev
```

Servidor por defecto: `http://localhost:4000`

### 2. Frontend

```bash
cd project-root/frontend
npm install
npm run dev
```

Cliente por defecto: `http://localhost:5173`

El frontend usa proxy de Vite para `/api`, así que no necesitas tocar URLs en desarrollo.

## Payload de ejemplo

```json
{
  "startLocation": { "lat": 41.3874, "lng": 2.1686 },
  "categories": ["cultural"],
  "subcategories": ["museum", "library"],
  "maxDistanceKm": 6,
  "maxPois": 5,
  "availableTimeMinutes": 240,
  "minRating": 4
}
```

## Próxima evolución recomendada

1. Sustituir `recommendationService.js` por un adaptador a Python.
2. Exportar desde notebooks un dataset final con `cluster_geo`, embeddings o similitudes precomputadas.
3. Añadir tests de API y validación formal de payloads.
