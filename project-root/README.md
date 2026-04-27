# Barcelona POIs Recommender Web

Aplicacion web desarrollada para integrar el sistema de recomendacion de rutas de POIs en Barcelona.

La idea principal del proyecto es que el usuario pueda introducir unas preferencias basicas desde la web y recibir una ruta de puntos de interes, no solo una lista suelta de recomendaciones. La ruta se genera usando el sistema hibrido final del proyecto: similitud por contenido, calidad del POI, proximidad geografica y restricciones de tiempo/distancia.

## Estructura general

```text
project-root/
  backend/     API Node.js + Express
  frontend/    Cliente React + Vite + Leaflet
  docs/        Documentacion tecnica del flujo web-modelo
  app/         Estructura Python previa conservada
  config/      Configuracion previa conservada
  tests/       Tests iniciales del proyecto

../ml_service/
  recommend_route.py   Motor Python del recomendador hibrido

../data/
  pois_barcelona_hibrido.parquet
  pois_barcelona_hibrido.csv
```

## Arquitectura actual

El flujo actual es:

```text
Frontend React
  -> Backend Node.js
  -> Motor Python del recomendador hibrido
  -> Dataset hibrido enriquecido
  -> Respuesta JSON
  -> Mapa y panel de resultados
```

El frontend no ejecuta directamente ningun notebook. La logica validada en el notebook del sistema hibrido se ha pasado a un script Python productivo:

```text
ml_service/recommend_route.py
```

Ese script es llamado internamente por el backend cuando se solicita una ruta.

## Backend

Carpeta:

```text
project-root/backend
```

Endpoints principales:

```text
GET  /api/health
GET  /api/pois
GET  /api/categories
POST /api/recommend-route
```

El endpoint mas importante es:

```text
POST /api/recommend-route
```

Este endpoint recibe las preferencias del usuario y devuelve:

- candidatos considerados por el modelo
- ruta final ordenada
- resumen de distancia, tiempo y puntuaciones
- metadatos sobre el metodo usado

Actualmente el modo esperado en la respuesta es:

```text
python-hybrid-recommender
```

## Motor hibrido

Archivo:

```text
ml_service/recommend_route.py
```

Este script contiene la version integrada del sistema hibrido final.

Hace principalmente dos cosas:

1. Selecciona candidatos:
   - calcula similitud TF-IDF usando `content_base`
   - aplica filtros de categoria, subcategoria, rating y distancia
   - combina `quality_signal`, similitud y proximidad
   - genera `hybrid_candidate_score`

2. Construye la ruta:
   - usa una heuristica greedy
   - respeta distancia maxima
   - respeta tiempo disponible
   - controla distancia maxima por tramo
   - usa `cluster_geo` para favorecer coherencia geografica

## Dataset usado

El sistema integrado usa el dataset final enriquecido:

```text
data/pois_barcelona_hibrido.parquet
```

Tambien existe una version CSV:

```text
data/pois_barcelona_hibrido.csv
```

El dataset se genera con:

```text
src/build_hybrid_dataset.py
```

Ese script no se ejecuta cada vez que se pide una recomendacion. Solo hace falta volver a ejecutarlo si se cambia el dataset base o la logica de enriquecimiento.

## Frontend

Carpeta:

```text
project-root/frontend
```

Tecnologias principales:

- React
- Vite
- Leaflet
- React Leaflet

La web permite:

- introducir punto de inicio
- seleccionar categorias y subcategorias
- definir distancia maxima
- definir numero maximo de POIs
- definir tiempo disponible
- definir rating minimo
- ver la ruta en mapa
- ver detalle y resumen de los POIs recomendados

## Ejecucion local

La forma mas comoda de arrancar todo es desde la raiz del repositorio:

```powershell
.\start-dev.ps1
```

Si PowerShell bloquea la ejecucion:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Esto abre dos ventanas:

- backend en `http://localhost:4000`
- frontend en `http://localhost:5173`

Para comprobar el backend:

```text
http://localhost:4000/api/health
```

Para abrir la web:

```text
http://localhost:5173
```

## Ejecucion manual

Backend:

```powershell
cd project-root/backend
npm install
npm run dev
```

Frontend:

```powershell
cd project-root/frontend
npm install
npm run dev
```

Si se ejecuta manualmente el backend, conviene asegurarse de que `PYTHON_BIN` apunta al entorno Python donde estan instalados `pandas`, `scikit-learn` y `pyarrow`.

Ejemplo:

```powershell
$env:PYTHON_BIN="C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"
npm run dev
```

## Payload de ejemplo

```json
{
  "startLocation": {
    "lat": 41.4035,
    "lng": 2.17437
  },
  "categories": ["religious"],
  "subcategories": ["cathedral"],
  "maxDistanceKm": 5,
  "maxPois": 5,
  "availableTimeMinutes": 240,
  "minRating": 4
}
```

## Documentacion adicional

En la carpeta `docs/` hay documentos utiles para entender la integracion:

```text
docs/integracion_modelo_hibrido_web.txt
docs/flujo_usuario_modelo_hibrido_web.txt
```

El primero explica la metodologia de integracion del modelo con la web.

El segundo explica el flujo completo desde que el usuario introduce preferencias hasta que se muestra la ruta en el mapa.

## Estado actual

El proyecto ya tiene conectada la web con el recomendador hibrido final.

La heuristica temporal inicial de Node.js se conserva en el codigo como referencia, pero el endpoint principal de recomendacion ya delega en el motor Python.

Quedan como posibles mejoras:

- anadir un campo de texto libre para preferencias semanticas
- mejorar la explicabilidad de cada POI recomendado
- anadir tests especificos del endpoint hibrido
- optimizar el motor Python para no recalcular TF-IDF en cada peticion
- convertir el motor Python en un servicio FastAPI persistente si se quiere una arquitectura mas cercana a produccion
