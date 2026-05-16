# Barcelona POIs Recommender Web

Esta carpeta contiene la aplicacion web del TFM.

La web conecta el sistema hibrido de recomendacion de rutas con una interfaz usable para empresas, usuarios y administracion.

## Estructura

```text
project-root/
|-- backend/    API Node.js + Express
|-- frontend/   Aplicacion React + Vite + Leaflet
|-- docs/       Documentacion tecnica y de defensa
|-- app/        Estructura Python previa conservada
|-- config/     Configuracion previa conservada
`-- tests/      Tests iniciales
```

Fuera de `project-root`, pero conectado con la web:

```text
../ml_service/recommend_route.py
../data/pois_barcelona_hibrido.parquet
../database/
```

## Arquitectura

```text
Frontend React
  -> Backend Express
  -> Motor Python hibrido
  -> Dataset hibrido
  -> Respuesta JSON
  -> Mapa, resultados y persistencia MySQL
```

El frontend no ejecuta notebooks. El notebook final del sistema hibrido se llevo a:

```text
../ml_service/recommend_route.py
```

## Vistas actuales

### Admin

Panel de administracion inicial:

- resumen de empresas, usuarios, activos, rutas y POIs
- crear empresas
- crear usuario de acceso al crear empresa
- crear usuarios manualmente
- asignar usuarios a empresa
- activar/desactivar usuarios
- buscador de empresas y usuarios

Esta vista queda asociada al rol `admin` mediante login JWT.

### Empresa

Vista para empresas/clientes:

- generador inteligente de rutas con el modelo hibrido
- constructor manual con catalogo de POIs
- editor de ruta activa
- guardado de rutas en MySQL

### Usuario

Vista para usuario final:

- cargar una ruta por codigo publico
- guardar rutas cargadas en el navegador
- consultar mapa, resumen y POIs

En el futuro esta vista cargara rutas asignadas al usuario autenticado.

## Backend

Carpeta:

```text
backend/
```

Documentacion especifica:

```text
backend/README.md
```

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
POST   /api/auth/login
GET    /api/auth/me
```

## Frontend

Carpeta:

```text
frontend/
```

Documentacion especifica:

```text
frontend/README.md
```

Tecnologias:

- React
- Vite
- Leaflet
- React Leaflet

## Base de datos

La BDD esta fuera de esta carpeta:

```text
../database/
```

Se usa para:

- empresas
- usuarios
- roles
- POIs importados
- rutas guardadas
- POIs de cada ruta

El recomendador sigue usando el dataset hibrido:

```text
../data/pois_barcelona_hibrido.parquet
```

## Ejecutar todo

Desde la raiz del repositorio:

```powershell
.\start-dev.ps1
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

## Ejecucion manual

Backend:

```powershell
cd project-root/backend
npm install
$env:PYTHON_BIN="C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"
npm run dev
```

Frontend:

```powershell
cd project-root/frontend
npm install
npm run dev
```

## Dependencias

Backend:

```text
bcryptjs
cors
csv-parse
dotenv
express
jsonwebtoken
mysql2
```

Frontend:

```text
react
react-dom
leaflet
react-leaflet
vite
@vitejs/plugin-react
```

Python usado por el recomendador:

```text
pandas
numpy
scikit-learn
pyarrow
```

## Documentacion tecnica

En `docs/`:

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

## Estado actual

La web ya esta conectada con el recomendador hibrido real, MySQL y login JWT. El siguiente salto importante es usar la sesion real para asignar rutas a usuarios finales y proteger todos los flujos privados.
