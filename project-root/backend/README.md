# Backend

Backend Node.js + Express de la aplicacion Barcelona POIs.

Su funcion es:

- exponer la API local
- llamar al motor Python del recomendador hibrido
- leer datos auxiliares de POIs/categorias
- guardar y recuperar rutas en MySQL
- gestionar el panel admin de empresas y usuarios
- gestionar usuarios finales de empresa y rutas asignadas

## Tecnologias

```text
Node.js v22.19.0
npm 10.9.3
Express
MySQL
bcryptjs
jsonwebtoken
```

Dependencias actuales:

```text
bcryptjs@^3.0.3
cors@^2.8.5
csv-parse@^5.5.6
dotenv@^16.4.5
express@^4.21.2
jsonwebtoken@^9.0.3
mysql2@^3.22.3
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

### Autenticacion

```text
POST /api/auth/login
GET  /api/auth/me
```

`POST /api/auth/login` valida email/password con `bcryptjs` y devuelve un token JWT.

`GET /api/auth/me` devuelve el usuario autenticado a partir del token enviado en:

```text
Authorization: Bearer <token>
```

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
GET  /api/routes/my
GET  /api/routes/:publicId
```

`POST /api/routes` guarda:

- ruta completa
- resumen
- preferencias
- navegacion
- POIs y orden
- usuario creador, empresa y usuario final asignado si existe

`GET /api/routes/my` devuelve las rutas asignadas al usuario autenticado.

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

### Empresa

```text
GET  /api/company/users
POST /api/company/users
```

Uso:

- listar usuarios finales de la empresa autenticada
- buscar usuarios finales desde frontend
- crear usuarios finales con password hasheada
- alimentar el selector de asignacion de rutas

Un usuario con rol `client` solo gestiona usuarios de su propia empresa. El rol `admin` puede consultar una vision mas amplia si se usa esta API.

## Estado de autenticacion

El backend ya tiene:

- tabla `users`
- tabla `roles`
- `password_hash`
- creacion de usuarios con bcrypt
- login con JWT
- endpoint `/api/auth/me`
- rutas asignadas a usuarios finales
- alta de usuarios finales desde la vista Empresa

Todavia falta:

- extender permisos por rol al resto de endpoints privados
- mejorar la gestion/listado de rutas guardadas desde la vista Empresa

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
