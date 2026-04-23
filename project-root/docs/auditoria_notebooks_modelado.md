# Auditoria de notebooks de modelado

## Alcance revisado

Se han auditado los notebooks de modelado ya existentes en:

- `modelo/Baseline_Recommender.ipynb`
- `modelo/Content_Based_Recommender.ipynb`
- `modelo/Geographic_Clustering.ipynb`

Tambien se ha contrastado la secuencia del trabajo con el Gantt del archivo:

- `Plan_desarrollo_producto_Oscar_Fernández.xlsx`

## Validacion frente al Gantt

La auditoria confirma que el siguiente bloque planificado y pendiente es:

- `Crear un modelo de Ranking Adicional (Random Forest para predecir score / usar Score directamente)`

Por tanto, la fase siguiente esta bien alineada con el plan del proyecto.

## Hallazgos por notebook

### 1. `Baseline_Recommender.ipynb`

Estado:

- Valido como baseline funcional.
- Coherente con el objetivo de disponer de una recomendacion inicial sin ML.
- Util para demostrar una primera logica de filtrado, ranking y ruta greedy.

Fortalezas:

- Usa variables relevantes para una primera recomendacion: `category`, `rating`, `score`, `visit_duration`, coordenadas.
- Introduce una ruta greedy simple que es una base razonable para fases posteriores.
- Define un `score_final` interpretable para el baseline.

Problemas detectados:

- No tiene celdas markdown, por lo que la explicabilidad es menor que en los notebooks posteriores.
- Mezcla varias decisiones en pocas celdas, lo que dificulta justificar el proceso paso a paso en memoria o defensa.
- No deja una conclusion tecnica final tan clara como los notebooks siguientes.

Decision de auditoria:

- No se modifica ahora para evitar refactorizacion innecesaria.
- Se considera `baseline estable`, pero con una mejora futura recomendable de documentacion interna.

### 2. `Content_Based_Recommender.ipynb`

Estado:

- Bien estructurado.
- Metodologia incremental correcta.
- Explicacion suficientemente clara para la fase en la que se encuentra.

Fortalezas:

- Compara dos versiones de `content` en lugar de asumir una sola opcion.
- Usa POIs de prueba representativos.
- Cierra el notebook con conclusiones y decision final.
- Elige explicitamente `content_v1` como baseline semantico.

Posibles mejoras:

- En una fase futura, añadir una evaluacion mas sistematica de relevancia o diversidad.
- Guardar una salida mas modular para integracion directa con el modelo hibrido.

Decision de auditoria:

- Se valida como `modulo estable`.
- No requiere cambios inmediatos.

### 3. `Geographic_Clustering.ipynb`

Estado:

- Bien estructurado.
- Coherente con el objetivo de incorporar proximidad espacial al sistema.
- Correctamente alineado con la futura generacion de rutas.

Fortalezas:

- Usa `latitude` y `longitude` de forma limpia y adecuada para K-Means.
- Justifica `k` con metodo del codo y silhouette score.
- Introduce `cluster_geo` como feature interpretable y reutilizable.
- Incluye visualizacion y lectura de resultados.

Problemas o matices detectados:

- Aparece un warning de `KMeans` en Windows relacionado con MKL, pero no invalida los resultados.
- La decision de `k=7` esta razonada, aunque conviene dejar claro en fases posteriores que se prioriza utilidad para rutas frente a maximo silhouette puro.

Decision de auditoria:

- Se valida como `modulo estable`.
- No se modifica ahora.

## Hallazgo clave para la fase de ranking

La auditoria del notebook `src/02_Data_Cleaning.ipynb` confirma que la variable `score` ya fue construida explicitamente mediante una formula determinista:

```python
score = rating * 0.7 + match_confidence * 0.3
```

Y ademas se aplica una penalizacion:

```python
if has_match_confidence == False:
    score *= 0.85
```

Esto implica que:

- `score` ya es una senal de ranking diseñada dentro del pipeline.
- Un modelo adicional como Random Forest no aportaria una senal nueva, sino una aproximacion aprendida de una variable ya derivada.
- Tecnica y metodologicamente, tiene mas sentido usar `score` directamente como ranking principal en esta fase.

## Decision de auditoria global

- No se realizan cambios agresivos sobre notebooks existentes.
- Los modulos `content-based` y `clustering geográfico` quedan validados como estables.
- El `baseline` queda validado como funcional, aunque con margen futuro de mejora documental.
- La nueva fase de ranking debe centrarse en justificar el uso directo de `score` y usar Random Forest solo como comparacion tecnica, no como reemplazo principal.

## Preparacion para el modelo hibrido

Tras esta auditoria, el proyecto queda conceptualmente preparado para combinar en la siguiente fase:

- similitud semantica: `content_v1`
- proximidad geografica: `cluster_geo`
- ranking: `score`
- generacion de ruta: logica greedy / optimizacion posterior

La conclusion tecnica recomendada es:

- usar `score` como entrada principal del modulo de ranking
- mantener Random Forest, si se desea, solo como experimento comparativo o sensibilidad metodologica
