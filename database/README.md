# Base de datos del proyecto

Esta carpeta contiene los scripts SQL iniciales para preparar la base de datos del sistema de recomendacion de rutas de POIs.

La idea es separar la parte de persistencia del resto del proyecto para poder revisarla y ajustarla antes de ejecutarla en MySQL Workbench.

## Objetivo inicial

La primera version de la BBDD esta pensada para:

- guardar usuarios
- preparar roles basicos
- guardar clientes, por ejemplo hoteles
- guardar POIs
- guardar rutas generadas
- guardar los POIs incluidos en cada ruta y su orden
- guardar preferencias y resumen de la ruta en JSON
- guardar informacion de navegacion/calculo peatonal cuando exista, por ejemplo
  la respuesta de OSRM usada para pintar la ruta en el mapa

## Orden recomendado de ejecucion

Cuando se revise y se quiera ejecutar en MySQL Workbench, el orden seria:

```text
01_create_database.sql
02_create_tables.sql
03_seed_initial_data.sql
```

## Scripts

```text
01_create_database.sql
```

Crea la base de datos y la selecciona con `USE`.

```text
02_create_tables.sql
```

Crea las tablas principales y sus relaciones.

```text
03_seed_initial_data.sql
```

Inserta datos iniciales minimos, como roles y un usuario/cliente demo.

```text
import_pois_to_mysql.py
```

Importa los POIs desde `data/pois_barcelona_hibrido.parquet` a la tabla `pois`.
Si falta la libreria `mysql-connector-python`, intenta instalarla
automaticamente en el entorno Python activo.
Si el entorno Python no puede leer parquet porque falta `pyarrow` o
`fastparquet`, usa automaticamente `data/pois_barcelona_hibrido.csv` como
alternativa.

Este archivo no crea el modelo ni recalcula el recomendador. Su funcion es
copiar los POIs enriquecidos que ya existen en el dataset hibrido a MySQL, para
que la base de datos tenga una tabla `pois` completa y preparada para futuras
funcionalidades de persistencia.

El flujo interno del importador es:

```text
1. Lee la configuracion de conexion desde database/db_config.local.json
2. Carga el dataset hibrido desde parquet
3. Si parquet no esta disponible en el entorno, usa el CSV equivalente
4. Recorre cada POI del dataset
5. Limpia valores nulos, NaN, arrays y tipos propios de pandas/numpy
6. Convierte cada fila al formato de la tabla pois
7. Traduce cluster_geo a una zona entendible de Barcelona
8. Guarda tambien la fila original completa en raw_data como JSON
9. Inserta cada POI en MySQL
10. Si el POI ya existe, lo actualiza en vez de duplicarlo
```

Por eso se puede ejecutar mas de una vez sin duplicar POIs, ya que usa
`ON DUPLICATE KEY UPDATE`.

## Configuracion de conexion a MySQL

La forma mas sencilla para este proyecto es tener la configuracion en codigo en:

```text
database/db_config.local.json
```

Contenido esperado:

```json
{
  "host": "localhost",
  "port": 3306,
  "database": "pois_recommender_bcn",
  "user": "root",
  "password": "tu_password_de_mysql"
}
```

Este archivo es local y esta ignorado por Git para no subir contrasenas. Tambien
queda un archivo de ejemplo:

```text
database/db_config.example.json
```

El script `import_pois_to_mysql.py` lee automaticamente
`database/db_config.local.json`. Si la password sigue con el texto de ejemplo,
la pedira por consola para evitar usar una credencial falsa.

## Importar POIs del dataset hibrido

Antes de importar todos los POIs, se puede hacer una prueba sin insertar datos:

```powershell
python database/import_pois_to_mysql.py --dry-run --limit 5
```

Ese comando solo comprueba que el dataset se puede leer y que los registros se
preparan correctamente. No se conecta a MySQL ni inserta filas.

Para importar todos los POIs:

```powershell
python database/import_pois_to_mysql.py
```

Este comando si se conecta a MySQL e inserta/actualiza los POIs en la tabla
`pois`.

Si se quiere importar solo una parte para probar contra la BBDD:

```powershell
python database/import_pois_to_mysql.py --limit 10
```

Si se quiere pasar la configuracion de MySQL por variables de entorno:

```powershell
$env:MYSQL_HOST="localhost"
$env:MYSQL_PORT="3306"
$env:MYSQL_DATABASE="pois_recommender_bcn"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="tu_password"
python database/import_pois_to_mysql.py
```

Si `MYSQL_PASSWORD` no esta definido, el script lo pedira por consola.

En condiciones normales, para trabajar en local con Workbench, no hace falta usar
variables de entorno: basta con editar `database/db_config.local.json`.

## Nota importante

Estos scripts son una primera propuesta. Antes de ejecutarlos conviene revisar:

- nombres de tablas y columnas
- roles definitivos
- si los POIs se cargaran desde CSV/parquet o desde backend
- si se quiere guardar toda la informacion de cada POI o solo referenciar su `poi_id`
- estrategia de autenticacion y contrasenas

La prioridad inicial no es montar un sistema complejo de usuarios, sino permitir:

```text
generar ruta -> guardarla -> recuperarla -> mostrarla otra vez en el mapa
```

La tabla `routes` incluye `navigation_json` para guardar la informacion de ruta
peatonal calculada en frontend, como geometria, distancia caminando, duracion y
modo de visualizacion.
