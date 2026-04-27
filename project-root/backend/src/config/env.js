import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

// __dirname no existe directamente en modulos ES, por eso reconstruimos la ruta
// del archivo actual a partir de import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// projectRoot apunta a project-root/, que contiene backend/, frontend/, docs/, etc.
const projectRoot = path.resolve(__dirname, "../../..");

// CSV usado por endpoints auxiliares como /api/categories y /api/pois.
// Para que la web este alineada con el modelo final, usamos el CSV hibrido.
const defaultDatasetPath = path.resolve(projectRoot, "../data/pois_barcelona_hibrido.csv");
const configuredDatasetPath = process.env.DATASET_PATH
  ? path.resolve(projectRoot, process.env.DATASET_PATH)
  : defaultDatasetPath;

// Script Python que contiene la version productiva del recomendador hibrido.
const defaultHybridRecommenderPath = path.resolve(
  projectRoot,
  "../ml_service/recommend_route.py",
);
const configuredHybridRecommenderPath = process.env.HYBRID_RECOMMENDER_PATH
  ? path.resolve(projectRoot, process.env.HYBRID_RECOMMENDER_PATH)
  : defaultHybridRecommenderPath;

export const env = {
  // Puerto del backend Express.
  port: Number(process.env.PORT || 4000),

  // Origen permitido para CORS. Vite suele arrancar el frontend en 5173.
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  // Dataset CSV usado por servicios auxiliares de POIs/categorias.
  datasetPath: configuredDatasetPath,

  // Ruta del motor Python del recomendador.
  hybridRecommenderPath: configuredHybridRecommenderPath,

  // Interprete Python. En desarrollo se pasa desde start-dev.ps1 para usar Conda.
  pythonBin: process.env.PYTHON_BIN || "python",
};
