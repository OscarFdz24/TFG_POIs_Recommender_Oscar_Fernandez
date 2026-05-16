# Sistema hibrido de recomendacion de rutas de POIs en Barcelona

Este repositorio contiene mi TFM: un sistema inteligente para recomendar rutas personalizadas de puntos de interes en Barcelona.

La idea principal no es recomendar POIs aislados, sino construir una ruta completa, viable y adaptada a las preferencias del usuario. Para ello se combinan senales de contenido, calidad, proximidad geografica y restricciones de ruta.

## Estado actual del proyecto

El proyecto ya tiene una primera version funcional de extremo a extremo:

```text
usuario/empresa/admin
  -> frontend React
  -> backend Node.js
  -> motor Python del recomendador hibrido
  -> dataset hibrido enriquecido
  -> ruta en mapa + persistencia en MySQL
```

Actualmente incluye:

- recomendador hibrido real integrado con la web
- generador inteligente de rutas
- constructor manual de rutas
- editor de rutas
- buscador/catalogo de POIs
- guardado y recuperacion de rutas en MySQL
- panel de administrador para empresas y usuarios
- importacion de POIs a MySQL
- interfaz responsive con modo claro/oscuro e idioma ES/EN

Todavia no hay login JWT real activado. El panel admin y las vistas por rol existen como base funcional, pero el control de acceso por usuario real es el siguiente paso.

## Estructura principal

```text
.
|-- data/
|   |-- pois_barcelona_hibrido.parquet
|   |-- pois_barcelona_hibrido.csv
|   |-- pois_barcelona_procesados.parquet
|   `-- pois_barcelona_procesados.csv
|
|-- database/
|   |-- 01_create_database.sql
|   |-- 02_create_tables.sql
|   |-- 03_seed_initial_data.sql
|   |-- 04_seed_auth_demo_users.sql
|   |-- import_pois_to_mysql.py
|   `-- README.md
|
|-- ml_service/
|   `-- recommend_route.py
|
|-- modelo/
|   |-- 01_Baseline_Recommender.ipynb
|   |-- 02_Content_Based_Recommender.ipynb
|   |-- 03_Geographic_Clustering.ipynb
|   |-- 04_Ranking_Adicional.ipynb
|   |-- 05_Route_Optimization_Greedy.ipynb
|   `-- 06_Hybrid_Recommender_Route_System.ipynb
|
|-- project-root/
|   |-- backend/
|   |-- frontend/
|   |-- docs/
|   `-- README.md
|
|-- src/
|   `-- build_hybrid_dataset.py
|
|-- start-dev.ps1
`-- README.md
```

## Metodologia

El desarrollo se ha hecho de forma incremental:

```text
limpieza y enriquecimiento de datos
-> baseline de recomendacion
-> recomendador basado en contenido con TF-IDF
-> clustering geografico
-> ranking por calidad/relevancia
-> optimizacion greedy de rutas
-> sistema hibrido final
-> integracion backend/frontend
-> persistencia MySQL
-> panel admin y gestion inicial de usuarios
```

Los notebooks documentan la parte experimental. La version integrada en la web esta en:

```text
ml_service/recommend_route.py
```

## Sistema hibrido

El recomendador tiene dos capas:

1. Seleccion de candidatos:
   - TF-IDF sobre `content_base`
   - similitud coseno
   - filtros por categorias, subcategorias, rating, zonas y restricciones
   - calidad mediante `quality_signal`
   - proximidad al origen

2. Construccion de ruta:
   - heuristica greedy
   - distancia maxima total
   - tiempo maximo disponible
   - distancia maxima por tramo
   - numero minimo/maximo de POIs
   - coherencia geografica con `cluster_geo`

El dataset principal usado por el motor es:

```text
data/pois_barcelona_hibrido.parquet
```

El CSV equivalente se mantiene como alternativa:

```text
data/pois_barcelona_hibrido.csv
```

El dataset hibrido se genera con:

```powershell
python src/build_hybrid_dataset.py
```

Este script no se ejecuta cada vez. Solo se vuelve a ejecutar si cambian los datos base o la logica de enriquecimiento.

## Aplicacion web

La aplicacion esta en:

```text
project-root/
```

Tiene tres vistas funcionales:

- **Admin**: gestion de empresas, usuarios, estado y datos generales.
- **Empresa**: generador inteligente, constructor manual y editor de rutas.
- **Usuario**: carga y consulta de rutas guardadas/asignadas.

En el futuro, estas vistas se seleccionaran automaticamente segun el rol tras login.

## Backend

Carpeta:

```text
project-root/backend
```

Tecnologias:

- Node.js
- Express
- MySQL con `mysql2`
- `bcryptjs` para guardar passwords hasheadas
- comunicacion interna con Python

Endpoints principales:

```text
GET    /api/health
GET    /api/categories
GET    /api/pois
POST   /api/recommend-route
POST   /api/routes
GET    /api/routes/:publicId
GET    /api/admin
POST   /api/admin/clients
POST   /api/admin/users
PATCH  /api/admin/users/:userId/status
```

## Frontend

Carpeta:

```text
project-root/frontend
```

Tecnologias:

- React
- Vite
- Leaflet
- React Leaflet

Funcionalidades:

- mapa interactivo
- sidebar de preferencias
- modo claro/oscuro
- idioma ES/EN
- generador inteligente
- constructor manual
- editor de rutas
- buscador de POIs
- vista de usuario para recuperar rutas
- panel admin responsive

## Base de datos MySQL

Carpeta:

```text
database/
```

Uso actual:

- roles
- empresas/clientes
- usuarios
- POIs importados desde el dataset hibrido
- rutas guardadas
- POIs de cada ruta y su orden
- JSON con preferencias, resumen, ruta y navegacion

Para el MVP, el recomendador sigue leyendo el parquet/CSV hibrido. MySQL se usa para persistencia y gestion de usuarios/rutas.

Orden recomendado:

```text
01_create_database.sql
02_create_tables.sql
03_seed_initial_data.sql
04_seed_auth_demo_users.sql
python database/import_pois_to_mysql.py
```

Usuarios demo preparados:

```text
admin.demo@example.com    / demo1234
empresa.demo@example.com  / demo1234
usuario.demo@example.com  / demo1234
```

La password se guarda como hash bcrypt en `users.password_hash`.

## Dependencias

### Python

Version usada:

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
mysql-connector-python
```

Instalacion orientativa:

```powershell
pip install pandas numpy scikit-learn pyarrow matplotlib jupyter notebook mysql-connector-python
```

### Backend Node.js

Dependencias actuales:

```text
bcryptjs
cors
csv-parse
dotenv
express
mysql2
```

Instalacion:

```powershell
cd project-root/backend
npm install
```

### Frontend React

Dependencias actuales:

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

Desde la raiz del repositorio:

```powershell
.\start-dev.ps1
```

Si PowerShell bloquea el script:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

En Git Bash:

```bash
powershell.exe -ExecutionPolicy Bypass -File ./start-dev.ps1
```

URLs:

```text
Backend:  http://localhost:4000
Frontend: http://localhost:5173
```

Comprobar backend:

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

## Documentacion adicional

En `project-root/docs/` hay documentos de apoyo para defensa y explicacion:

```text
apis_del_proyecto.txt
auditoria_notebooks_modelado.md
explicacion_modelo_hibrido_final.txt
flujo_usuario_modelo_hibrido_web.txt
historial_trabajo_2026-04-27.txt
integracion_modelo_hibrido_web.txt
preguntas_frecuentes_defensa.txt
uso_ml_en_el_recomendador.txt
```

## Siguientes pasos

Los siguientes pasos naturales son:

- implementar login real con JWT
- proteger endpoints por rol
- asociar rutas a empresa y usuario autenticado
- permitir que empresa asigne rutas a usuarios
- crear panel de usuario final conectado a BDD
- anadir tests de backend y recomendador
- mejorar explicabilidad de POIs con textos enriquecidos

## Idea principal

El valor del proyecto esta en unir data science, machine learning, optimizacion heuristica, backend, frontend y persistencia para pasar de un modelo experimental a una aplicacion web funcional de recomendacion de rutas.
