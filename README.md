# Sistema hibrido de recomendacion de rutas de POIs en Barcelona

Este proyecto corresponde a mi TFM y consiste en el desarrollo de un sistema inteligente para recomendar rutas personalizadas de puntos de interes en Barcelona.

La idea no es recomendar POIs aislados, sino construir una ruta completa y viable para el usuario teniendo en cuenta preferencias, calidad de los lugares, similitud tematica, proximidad geografica y restricciones de tiempo/distancia.

## Objetivo del proyecto

El objetivo principal es crear un sistema de recomendacion hibrido capaz de:

- recomendar POIs relevantes para el usuario
- ordenar esos POIs como una ruta visitable
- respetar restricciones de distancia y tiempo
- combinar informacion textual, calidad y posicion geografica
- integrar el modelo en una aplicacion web funcional

El sistema final conecta:

```text
Frontend React
  -> Backend Node.js
  -> Motor Python del recomendador hibrido
  -> Dataset enriquecido de POIs
  -> Ruta recomendada en mapa
```

## Estructura del repositorio

```text
.
├── data/
│   ├── pois_barcelona_procesados.parquet
│   ├── pois_barcelona_procesados.csv
│   ├── pois_barcelona_hibrido.parquet
│   └── pois_barcelona_hibrido.csv
│
├── src/
│   ├── build_hybrid_dataset.py
│   └── functions/
│
├── modelo/
│   ├── 01_Baseline_Recommender.ipynb
│   ├── 02_Content_Based_Recommender.ipynb
│   ├── 03_Geographic_Clustering.ipynb
│   ├── 04_Ranking_Adicional.ipynb
│   ├── 05_Route_Optimization_Greedy.ipynb
│   └── 06_Hybrid_Recommender_Route_System.ipynb
│
├── ml_service/
│   └── recommend_route.py
│
├── project-root/
│   ├── backend/
│   ├── frontend/
│   ├── docs/
│   ├── app/
│   ├── config/
│   └── tests/
│
├── start-dev.ps1
└── README.md
```

## Metodologia seguida

El proyecto se ha desarrollado de forma incremental:

```text
exploracion y limpieza de datos
-> baseline de recomendacion
-> recomendador basado en contenido con TF-IDF
-> clustering geografico
-> analisis adicional de ranking/calidad
-> optimizacion greedy de rutas
-> sistema hibrido final
-> integracion web
```

Los notebooks documentan la parte experimental y de modelado. La logica final integrada en la web esta en:

```text
ml_service/recommend_route.py
```

## Sistema hibrido de recomendacion

El sistema se divide en dos fases.

### 1. Seleccion de candidatos

Se calculan candidatos combinando:

- similitud semantica con TF-IDF
- calidad del POI mediante `quality_signal`
- proximidad al punto inicial
- filtros del usuario

El score principal de esta fase es:

```text
hybrid_candidate_score =
  0.45 * quality_norm +
  0.35 * similarity_norm +
  0.20 * start_proximity_norm
```

### 2. Construccion de ruta

Con los candidatos seleccionados se construye una ruta usando una heuristica greedy.

La ruta tiene en cuenta:

- numero maximo de POIs
- distancia maxima total
- tiempo maximo disponible
- distancia maxima entre tramos
- retorno al origen
- coherencia geografica mediante `cluster_geo`

## Dataset hibrido

El dataset final usado por el recomendador es:

```text
data/pois_barcelona_hibrido.parquet
```

Tambien hay una version CSV:

```text
data/pois_barcelona_hibrido.csv
```

Este dataset se genera con:

```text
src/build_hybrid_dataset.py
```

Incluye columnas como:

- `content_base`
- `quality_signal`
- `cluster_geo`
- `rating_filled`
- `visit_duration_filled`
- `score_norm`
- `rating_norm`
- `match_confidence_norm`

El script de creacion del dataset no se ejecuta en cada recomendacion. Solo debe volver a ejecutarse si cambian los datos base o la logica de enriquecimiento.

## Aplicacion web

La web esta dentro de:

```text
project-root/
```

### Backend

Carpeta:

```text
project-root/backend
```

Tecnologias:

- Node.js
- Express

Endpoints principales:

```text
GET  /api/health
GET  /api/pois
GET  /api/categories
POST /api/recommend-route
```

El endpoint principal es:

```text
POST /api/recommend-route
```

Este endpoint recibe las preferencias del usuario, llama al motor Python y devuelve la ruta recomendada.

### Frontend

Carpeta:

```text
project-root/frontend
```

Tecnologias:

- React
- Vite
- Leaflet
- React Leaflet

La interfaz permite:

- introducir punto de inicio
- seleccionar categorias y subcategorias
- definir distancia maxima
- definir numero maximo de POIs
- definir tiempo disponible
- definir rating minimo
- visualizar la ruta en un mapa
- consultar el detalle de cada POI recomendado

## APIs utilizadas

El proyecto usa tres niveles de comunicacion:

### API propia del backend

Base local:

```text
http://localhost:4000/api
```

Endpoints:

- `/api/health`
- `/api/pois`
- `/api/categories`
- `/api/recommend-route`

### Comunicacion interna Node.js -> Python

Node.js ejecuta:

```text
ml_service/recommend_route.py
```

y le envia las preferencias del usuario en JSON mediante `stdin`. Python responde con otro JSON mediante `stdout`.

### API externa OSRM

Se usa OSRM para calcular el trazado peatonal entre los POIs ya seleccionados por el modelo:

```text
https://router.project-osrm.org/route/v1/foot/
```

OSRM no recomienda POIs. Solo calcula la ruta caminando entre los puntos que ya ha decidido el recomendador hibrido.

## Base de datos MySQL

El proyecto incluye una primera estructura de base de datos en:

```text
database/
```

Para el MVP del TFM, la BBDD se usa como capa de persistencia, no como fuente
principal del modelo. Es decir:

```text
parquet/csv hibrido -> recomendador Python
MySQL -> usuarios, clientes, POIs importados y rutas guardadas
```

Los POIs se pueden cargar en MySQL con:

```powershell
python database/import_pois_to_mysql.py
```

Antes se puede probar sin insertar datos:

```powershell
python database/import_pois_to_mysql.py --dry-run --limit 5
```

La configuracion local de MySQL se guarda en:

```text
database/db_config.local.json
```

Ese archivo queda ignorado por Git para no subir contrasenas. El archivo de
referencia es:

```text
database/db_config.example.json
```

## Dependencias necesarias

### Python

Version usada durante el desarrollo:

```text
Python 3.11
```

Librerias principales:

```text
pandas
numpy
scikit-learn
pyarrow
matplotlib
jupyter
notebook
flask
mysql-connector-python
```

Uso principal de cada una:

- `pandas`: carga y manipulacion de datasets
- `numpy`: operaciones numericas
- `scikit-learn`: TF-IDF, similitud coseno y K-Means
- `pyarrow`: lectura/escritura de parquet
- `matplotlib`: visualizaciones en notebooks
- `jupyter` / `notebook`: ejecucion de notebooks
- `flask`: estructura Python previa conservada en `project-root/app`
- `mysql-connector-python`: conexion desde Python a MySQL para importar los POIs a la BBDD

Instalacion orientativa:

```powershell
pip install pandas numpy scikit-learn pyarrow matplotlib jupyter notebook flask mysql-connector-python
```

Nota: para importar POIs a MySQL, `pyarrow` permite leer el fichero parquet. Si
no esta instalado, el importador usa automaticamente el CSV hibrido equivalente.

En mi entorno local el Python usado por el backend es:

```text
C:\Users\User\miniconda3\envs\master_ds_clean\python.exe
```

### Backend Node.js

Carpeta:

```text
project-root/backend
```

Dependencias:

```text
cors
csv-parse
dotenv
express
```

Instalacion:

```powershell
cd project-root/backend
npm install
```

### Frontend React

Carpeta:

```text
project-root/frontend
```

Dependencias:

```text
react
react-dom
leaflet
react-leaflet
vite
@vitejs/plugin-react
```

Instalacion:

```powershell
cd project-root/frontend
npm install
```

## Ejecucion local

La forma mas comoda de arrancar backend y frontend es desde la raiz del repositorio:

```powershell
.\start-dev.ps1
```

Si PowerShell bloquea la ejecucion:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Esto abre:

```text
Backend:  http://localhost:4000
Frontend: http://localhost:5173
```

Comprobacion del backend:

```text
http://localhost:4000/api/health
```

## Ejecucion manual

Backend:

```powershell
cd project-root/backend
$env:PYTHON_BIN="C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"
npm run dev
```

Frontend:

```powershell
cd project-root/frontend
npm run dev
```

## Ejemplo de payload

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

Dentro de:

```text
project-root/docs
```

hay varios documentos utiles:

```text
integracion_modelo_hibrido_web.txt
flujo_usuario_modelo_hibrido_web.txt
apis_del_proyecto.txt
uso_ml_en_el_recomendador.txt
preguntas_frecuentes_defensa.txt
```

Estos documentos explican:

- como se conecta la web con el modelo
- que ocurre desde que el usuario introduce preferencias
- que APIs se usan
- como se aplica Machine Learning
- posibles preguntas para la defensa del TFM

## Estado actual

El proyecto ya tiene una primera integracion funcional de extremo a extremo:

```text
usuario -> web -> backend -> motor hibrido Python -> ruta -> mapa
```

La web ya consume el recomendador hibrido final a traves del endpoint:

```text
POST /api/recommend-route
```

## Posibles mejoras futuras

Algunas mejoras posibles son:

- anadir un campo de texto libre para preferencias semanticas
- cachear la matriz TF-IDF para no recalcularla en cada peticion
- convertir el motor Python en una API FastAPI persistente
- anadir tests del endpoint hibrido
- mejorar la explicabilidad de cada POI recomendado
- incorporar horarios de apertura de forma mas estricta
- comparar formalmente los resultados contra el baseline
- probar embeddings semanticos como alternativa a TF-IDF
- conectar login y persistencia de rutas usando la BBDD MySQL
- permitir recuperar rutas guardadas por usuario o cliente/hotel

## Idea principal del proyecto

El valor del proyecto esta en pasar de una recomendacion simple de POIs a un sistema completo de recomendacion de rutas, combinando tecnicas de data science, machine learning, heuristicas de optimizacion e integracion web.
