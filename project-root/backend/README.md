# Backend

Backend Node.js + Express de la aplicacion Barcelona POIs.

Su funcion es:

- exponer la API local
- llamar al motor Python del recomendador hibrido
- leer datos auxiliares de POIs/categorias
- guardar y recuperar rutas en MySQL
- gestionar el panel admin de empresas y usuarios

## Tecnologias

```text
Node.js
Express
MySQL
bcryptjs
```

Dependencias actuales:

```text
bcryptjs
cors
csv-parse
dotenv
express
mysql2
```

## Scripts

```powershell
npm run dev
npm start
```

`npm run dev` usa:

```text
node --watch src/server.js
```

## Estructura

```text
backend/
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- routes/
|   |-- controllers/
|   |-- services/
|   |-- config/
|   `-- utils/
|-- package.json
`-- README.md
```

## Configuracion

El backend lee configuracion desde:

- variables de entorno
- `database/db_config.local.json`

Variables utiles:

```text
PORT
CLIENT_ORIGIN
DATASET_PATH
HYBRID_RECOMMENDER_PATH
PYTHON_BIN
MYSQL_HOST
MYSQL_PORT
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
```

En desarrollo, `start-dev.ps1` suele definir `PYTHON_BIN` para usar el entorno Conda correcto.

## Endpoints

### Salud

```text
GET /api/health
```

Comprueba que el backend esta levantado.

### POIs y categorias

```text
GET /api/categories
GET /api/pois
```

`/api/pois` acepta filtros:

```text
q
category
subcategory
neighborhoodZone
minRating
limit
```

Se usa para el catalogo de POIs del constructor manual y editor.

### Recomendacion

```text
POST /api/recommend-route
```

Recibe preferencias del usuario y llama internamente a:

```text
../../ml_service/recommend_route.py
```

El backend envia JSON por `stdin` y recibe JSON por `stdout`.

### Rutas guardadas

```text
POST /api/routes
GET  /api/routes/:publicId
```

`POST /api/routes` guarda:

- ruta completa
- resumen
- preferencias
- navegacion
- POIs y orden

Tablas usadas:

```text
routes
route_pois
```

### Admin

```text
GET    /api/admin
POST   /api/admin/clients
POST   /api/admin/users
PATCH  /api/admin/users/:userId/status
```

Uso:

- listar roles, empresas, usuarios y estadisticas
- crear empresa
- crear usuario de acceso de empresa
- crear usuarios manualmente
- activar/desactivar usuarios

Passwords:

- se reciben en texto plano desde el formulario
- se hashean con `bcryptjs`
- se guardan en `users.password_hash`

## Estado de autenticacion

El backend ya tiene:

- tabla `users`
- tabla `roles`
- `password_hash`
- creacion de usuarios con bcrypt

Todavia falta:

- endpoint de login
- JWT
- middleware de autenticacion
- proteccion por rol

## Ejecutar

```powershell
cd project-root/backend
npm install
$env:PYTHON_BIN="C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"
npm run dev
```

Backend:

```text
http://localhost:4000
```

Health:

```text
http://localhost:4000/api/health
```

## Verificacion

Comprobar sintaxis de un archivo:

```powershell
node --check src/services/adminService.js
```

Probar endpoints:

- navegador para `GET`
- Thunder Client para `POST`/`PATCH`

## Notas

El backend no recomienda POIs por si solo. La recomendacion real la calcula el motor Python. Node.js actua como capa API, coordinacion, persistencia y comunicacion con frontend.
