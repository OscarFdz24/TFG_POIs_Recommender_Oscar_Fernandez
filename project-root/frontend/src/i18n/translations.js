export const translations = {
  es: {
    languageCode: "es",
    app: {
      eyebrow: "TFG · Recomendacion de rutas",
      title: "Planificador inteligente de POIs en Barcelona",
      subtitle:
        "Interfaz preparada para conectar la futura logica hibrida del recomendador: preferencias del usuario, ranking, proximidad geografica y rutas optimizadas.",
      loading: "Cargando catalogo de categorias y estado del backend...",
      backend: "Backend",
      backendActive: "Activo",
      backendOffline: "Sin conexion",
    },
    controls: {
      theme: "Tema",
      themeDark: "Oscuro",
      themeLight: "Claro",
      language: "Idioma",
      languageEs: "ES",
      languageEn: "EN",
    },
    form: {
      eyebrow: "Preferencias",
      title: "Disena una ruta turistica personalizada",
      useLocation: "Usar mi ubicacion",
      locating: "Ubicando...",
      latitude: "Latitud inicial",
      longitude: "Longitud inicial",
      categories: "Categorias de interes",
      subcategories: "Subcategorias de interes",
      maxDistance: "Distancia maxima (km)",
      maxPois: "Numero maximo de POIs",
      availableTime: "Tiempo disponible (min)",
      minRating: "Rating minimo",
      multiSelectHelp: "Seleccion multiple disponible con Ctrl o Cmd.",
      submit: "Generar ruta",
      submitting: "Generando ruta...",
    },
    overview: {
      eyebrow: "Resumen",
      title: "Estado actual de la ruta",
      generatedPois: "POIs generados",
      routeDistance: "Distancia de ruta",
      visitTime: "Tiempo de visita",
      travelTime: "Desplazamiento",
      totalTime: "Tiempo total",
      routeMode: "Modo de ruta",
      routeModeWalking: "Callejeando",
      routeModeDirect: "Linea recta",
    },
    results: {
      eyebrow: "Resultados",
      title: "POIs recomendados",
      routeSequence: "Secuencia de la ruta",
      start: "Inicio",
      startDescription: "Punto de salida",
      distance: "Distancia",
      visitTime: "Tiempo visita",
      travelTime: "Desplazamiento",
      totalRoute: "Total ruta",
      fewerPois:
        "La ruta devuelve menos POIs de los pedidos porque con los filtros actuales no caben mas candidatos razonables.",
      rating: "Rating",
      score: "Score",
      fromStart: "Inicio",
      visit: "Visita",
    },
    map: {
      eyebrow: "Mapa",
      title: "Ruta interactiva",
      startPoint: "Punto inicial",
      selected: "Seleccionado",
      routeDisplay: "Visualizacion",
      walking: "Callejeando",
      direct: "Linea recta",
    },
    detail: {
      eyebrow: "Detalle",
      emptyTitle: "Selecciona un POI",
      emptyText:
        "Haz clic en un marcador o en un resultado para inspeccionar la ficha completa.",
      route: "Ruta",
      category: "Categoria",
      subcategory: "Subcategoria",
      rating: "Rating",
      score: "Score",
      visit: "Visita",
      fromStart: "Desde inicio",
      fromPrevious: "Desde anterior",
      coordinates: "Coordenadas",
      cluster: "Cluster",
      confidence: "Confidence",
      tags: "Etiquetas",
    },
    empty: {
      eyebrow: "Resultados",
      title: "Tu ruta aparecera aqui",
      description:
        "Introduce preferencias, genera una ruta y podras explorar los POIs sobre mapa, orden de recorrido y detalle ampliado.",
    },
    common: {
      notAvailable: "N/A",
    },
    geo: {
      unsupported: "Tu navegador no soporta geolocalizacion.",
      unavailable: "No se pudo obtener tu ubicacion actual.",
    },
    notes: {
      walkingNetwork:
        "La distancia y el trazado del mapa se calculan sobre red viaria peatonal.",
      walkingFallback:
        "No se pudo recuperar la ruta callejeando y se muestra trazado directo como respaldo.",
      strictHeuristic:
        "Ruta ordenada con una heuristica greedy limitada por distancia y tiempo.",
      filtered:
        "Se aplican filtros de categoria, subcategoria, rating y distancia desde el punto inicial.",
      ranked:
        "Los candidatos se ordenan por score, rating, confianza y proximidad.",
      fallbackBuilder:
        "Se uso una heuristica de respaldo mas flexible para acercarse al numero de POIs solicitado.",
      requestedPrefix: "Se solicitaron",
      noCandidatesPrefix: "No quedaron candidatos tras aplicar filtros",
    },
  },
  en: {
    languageCode: "en",
    app: {
      eyebrow: "Thesis · Route recommendation",
      title: "Smart POI planner for Barcelona",
      subtitle:
        "Interface prepared to connect the future hybrid recommender logic: user preferences, ranking, geographic proximity and optimized routes.",
      loading: "Loading category catalog and backend status...",
      backend: "Backend",
      backendActive: "Active",
      backendOffline: "Offline",
    },
    controls: {
      theme: "Theme",
      themeDark: "Dark",
      themeLight: "Light",
      language: "Language",
      languageEs: "ES",
      languageEn: "EN",
    },
    form: {
      eyebrow: "Preferences",
      title: "Design a personalized tourist route",
      useLocation: "Use my location",
      locating: "Locating...",
      latitude: "Starting latitude",
      longitude: "Starting longitude",
      categories: "Interest categories",
      subcategories: "Interest subcategories",
      maxDistance: "Maximum distance (km)",
      maxPois: "Maximum number of POIs",
      availableTime: "Available time (min)",
      minRating: "Minimum rating",
      multiSelectHelp: "Multi-select available with Ctrl or Cmd.",
      submit: "Generate route",
      submitting: "Generating route...",
    },
    overview: {
      eyebrow: "Overview",
      title: "Current route status",
      generatedPois: "Generated POIs",
      routeDistance: "Route distance",
      visitTime: "Visit time",
      travelTime: "Travel time",
      totalTime: "Total time",
      routeMode: "Route mode",
      routeModeWalking: "Walking",
      routeModeDirect: "Straight line",
    },
    results: {
      eyebrow: "Results",
      title: "Recommended POIs",
      routeSequence: "Route sequence",
      start: "Start",
      startDescription: "Starting point",
      distance: "Distance",
      visitTime: "Visit time",
      travelTime: "Travel",
      totalRoute: "Total route",
      fewerPois:
        "The route returns fewer POIs than requested because no more reasonable candidates fit the current filters.",
      rating: "Rating",
      score: "Score",
      fromStart: "Start",
      visit: "Visit",
    },
    map: {
      eyebrow: "Map",
      title: "Interactive route",
      startPoint: "Starting point",
      selected: "Selected",
      routeDisplay: "Display",
      walking: "Walking",
      direct: "Straight line",
    },
    detail: {
      eyebrow: "Detail",
      emptyTitle: "Select a POI",
      emptyText:
        "Click a marker or a result item to inspect the full record.",
      route: "Route",
      category: "Category",
      subcategory: "Subcategory",
      rating: "Rating",
      score: "Score",
      visit: "Visit",
      fromStart: "From start",
      fromPrevious: "From previous",
      coordinates: "Coordinates",
      cluster: "Cluster",
      confidence: "Confidence",
      tags: "Tags",
    },
    empty: {
      eyebrow: "Results",
      title: "Your route will appear here",
      description:
        "Enter preferences, generate a route and explore the POIs on the map, route order and extended detail.",
    },
    common: {
      notAvailable: "N/A",
    },
    geo: {
      unsupported: "Your browser does not support geolocation.",
      unavailable: "Could not retrieve your current location.",
    },
    notes: {
      walkingNetwork:
        "Distance and map geometry are calculated over the pedestrian street network.",
      walkingFallback:
        "The walking route could not be retrieved, so a direct fallback line is displayed.",
      strictHeuristic:
        "Route ordered with a greedy heuristic constrained by distance and time.",
      filtered:
        "Filters are applied for category, subcategory, rating and distance from the starting point.",
      ranked:
        "Candidates are ranked by score, rating, confidence and proximity.",
      fallbackBuilder:
        "A softer fallback heuristic was used to get closer to the requested number of POIs.",
      requestedPrefix: "Requested",
      noCandidatesPrefix: "No candidates remained after applying filters",
    },
  },
};

export function translateMetaNote(note, t) {
  if (!note) {
    return "";
  }

  if (note.startsWith("La distancia y el trazado del mapa se calculan")) {
    return t.notes.walkingNetwork;
  }

  if (note.startsWith("No se pudo recuperar la ruta callejeando")) {
    return t.notes.walkingFallback;
  }

  if (note.startsWith("Filtered by category")) {
    return t.notes.filtered;
  }

  if (note.startsWith("Ranked by score")) {
    return t.notes.ranked;
  }

  if (note.startsWith("Ordered with a greedy route heuristic")) {
    return t.notes.strictHeuristic;
  }

  if (note.startsWith("A softer fallback route builder")) {
    return t.notes.fallbackBuilder;
  }

  if (note.startsWith("Requested ")) {
    return t.languageCode === "es"
      ? note
          .replace("Requested ", "Se solicitaron ")
          .replace(" POIs, but only ", " POIs, pero solo ")
          .replace(" fit the current filters, time budget (", " caben con los filtros actuales, el tiempo disponible (")
          .replace(" min) and distance budget (", " min) y el limite de distancia (")
          .replace(" km).", " km).")
      : note;
  }

  if (note.startsWith("No candidates remained after applying filters")) {
    return t.languageCode === "es"
      ? note.replace("No candidates remained after applying filters", "No quedaron candidatos tras aplicar filtros")
      : note;
  }

  return note;
}
