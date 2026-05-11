export const translations = {
  es: {
    languageCode: "es",
    app: {
      eyebrow: "TFG · Recomendacion de rutas",
      title: "Planificador inteligente de POIs en Barcelona",
      subtitle:
        "Sistema hibrido conectado al modelo real: preferencias del usuario, similitud tematica, calidad, proximidad geografica y ruta optimizada.",
      loading: "Cargando catalogo de categorias y estado del backend...",
      backend: "Backend",
      backendActive: "Activo",
      backendOffline: "Sin conexion",
    },
    topbar: {
      title: "Barcelona POIs",
      subtitle: "Recomendador hibrido de rutas",
    },
    sidebar: {
      show: "Mostrar preferencias",
      hide: "Ocultar preferencias",
    },
    controls: {
      theme: "Tema",
      themeDark: "Oscuro",
      themeDarkShort: "Osc",
      themeLight: "Claro",
      themeLightShort: "Cla",
      language: "Idioma",
      languageEs: "ES",
      languageEn: "EN",
    },
    form: {
      eyebrow: "Preferencias",
      title: "Disena una ruta turistica personalizada",
      useLocation: "Usar mi ubicacion",
      locating: "Ubicando...",
      locationSection: "Ubicacion",
      locationHelp: "Define desde donde empezara la ruta.",
      poiSection: "Preferencias de POIs",
      poiHelp: "Selecciona tematicas de interes. Puedes dejarlo vacio para explorar mas opciones.",
      routeSection: "Restricciones de ruta",
      routeHelp: "Ajusta el tamano, tiempo y distancia maxima de la experiencia.",
      neighborhoodZones: "Zonas de la ciudad",
      neighborhoodZoneOptions: [
        "Norte verde y miradores",
        "Centro historico",
        "Oeste y zona alta",
        "Eixample y Gracia",
        "Norte urbano",
        "Montjuic y sur",
        "Este litoral y Poblenou",
      ],
      latitude: "Latitud inicial",
      longitude: "Longitud inicial",
      categories: "Categorias de interes",
      categoriesHelp: "Elige una o varias tematicas principales.",
      subcategories: "Subcategorias de interes",
      subcategoriesHelp: "Refina la busqueda con tipos concretos de POIs.",
      maxDistance: "Distancia maxima (km)",
      minPois: "Numero minimo de POIs",
      maxPois: "Numero maximo de POIs",
      availableTime: "Tiempo disponible (min)",
      minRating: "Rating minimo",
      multiSelectHelp: "Seleccion multiple disponible con Ctrl o Cmd.",
      submit: "Generar ruta",
      submitting: "Generando ruta...",
      minPoisError: "El numero minimo de POIs debe ser menor o igual que el maximo.",
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
      relevance: "Relevancia",
      fromStart: "Inicio",
      fromPrevious: "Tramo",
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
      confidence: "Confianza",
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
    errors: {
      generic: "No se ha podido generar la ruta. Revisa las preferencias e intentalo de nuevo.",
      invalidLocation: "La ubicacion inicial no es valida. Revisa latitud y longitud.",
      minPoisGreaterThanMax: "El minimo de POIs no puede ser mayor que el maximo.",
      minPoisNotReached:
        "No se ha podido generar una ruta con el numero minimo de POIs solicitado. Prueba a aumentar la distancia maxima o reducir el minimo de POIs.",
      network: "No se pudo conectar con el backend. Comprueba que el servidor esta arrancado.",
    },
    geo: {
      unsupported: "Tu navegador no soporta geolocalizacion.",
      unavailable: "No se pudo obtener tu ubicacion actual.",
    },
    notes: {
      hybridSystem:
        "Sistema hibrido: TF-IDF, calidad del POI, proximidad y coherencia geografica.",
      hybridCandidates:
        "Candidatos filtrados por preferencias y ordenados por hybrid_candidate_score.",
      hybridRoute:
        "Ruta construida con heuristica greedy y restricciones de distancia, tiempo y tramo maximo.",
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
    },
  },
  en: {
    languageCode: "en",
    app: {
      eyebrow: "Thesis · Route recommendation",
      title: "Smart POI planner for Barcelona",
      subtitle:
        "Hybrid system connected to the real model: user preferences, thematic similarity, quality, geographic proximity and optimized routing.",
      loading: "Loading category catalog and backend status...",
      backend: "Backend",
      backendActive: "Active",
      backendOffline: "Offline",
    },
    topbar: {
      title: "Barcelona POIs",
      subtitle: "Hybrid route recommender",
    },
    sidebar: {
      show: "Show preferences",
      hide: "Hide preferences",
    },
    controls: {
      theme: "Theme",
      themeDark: "Dark",
      themeDarkShort: "Dark",
      themeLight: "Light",
      themeLightShort: "Light",
      language: "Language",
      languageEs: "ES",
      languageEn: "EN",
    },
    form: {
      eyebrow: "Preferences",
      title: "Design a personalized tourist route",
      useLocation: "Use my location",
      locating: "Locating...",
      locationSection: "Location",
      locationHelp: "Define where the route will start.",
      poiSection: "POI preferences",
      poiHelp: "Select topics of interest. Leave them empty to explore more options.",
      routeSection: "Route constraints",
      routeHelp: "Adjust route size, available time and maximum distance.",
      neighborhoodZones: "City areas",
      neighborhoodZoneOptions: [
        "Norte verde y miradores",
        "Centro historico",
        "Oeste y zona alta",
        "Eixample y Gracia",
        "Norte urbano",
        "Montjuic y sur",
        "Este litoral y Poblenou",
      ],
      latitude: "Starting latitude",
      longitude: "Starting longitude",
      categories: "Interest categories",
      categoriesHelp: "Choose one or several main themes.",
      subcategories: "Interest subcategories",
      subcategoriesHelp: "Refine the search with specific POI types.",
      maxDistance: "Maximum distance (km)",
      minPois: "Minimum number of POIs",
      maxPois: "Maximum number of POIs",
      availableTime: "Available time (min)",
      minRating: "Minimum rating",
      multiSelectHelp: "Multi-select available with Ctrl or Cmd.",
      submit: "Generate route",
      submitting: "Generating route...",
      minPoisError: "The minimum number of POIs must be lower than or equal to the maximum.",
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
      relevance: "Relevance",
      fromStart: "Start",
      fromPrevious: "Leg",
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
    errors: {
      generic: "The route could not be generated. Review the preferences and try again.",
      invalidLocation: "The starting location is not valid. Check latitude and longitude.",
      minPoisGreaterThanMax: "The minimum number of POIs cannot be greater than the maximum.",
      minPoisNotReached:
        "The system could not generate a route with the requested minimum number of POIs. Try increasing the maximum distance or reducing the minimum.",
      network: "Could not connect to the backend. Check that the server is running.",
    },
    geo: {
      unsupported: "Your browser does not support geolocation.",
      unavailable: "Could not retrieve your current location.",
    },
    notes: {
      hybridSystem:
        "Hybrid system: TF-IDF, POI quality, proximity and geographic coherence.",
      hybridCandidates:
        "Candidates filtered by preferences and ranked by hybrid_candidate_score.",
      hybridRoute:
        "Route built with a greedy heuristic and distance, time and leg constraints.",
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
    },
  },
};

export function translateMetaNote(note, t) {
  if (!note) {
    return "";
  }

  if (note.startsWith("Sistema hibrido:")) {
    return t.notes.hybridSystem;
  }

  if (note.startsWith("Candidatos filtrados")) {
    return t.notes.hybridCandidates;
  }

  if (note.startsWith("Ruta construida")) {
    return t.notes.hybridRoute;
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

  if (note.startsWith("Se solicitaron")) {
    return note;
  }

  if (note.startsWith("No candidates remained after applying filters")) {
    return t.languageCode === "es"
      ? note.replace("No candidates remained after applying filters", "No quedaron candidatos tras aplicar filtros")
      : note;
  }

  return note;
}
