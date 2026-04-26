import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const defaultDatasetPath = path.resolve(projectRoot, "../data/pois_barcelona_hibrido.csv");
const configuredDatasetPath = process.env.DATASET_PATH
  ? path.resolve(projectRoot, process.env.DATASET_PATH)
  : defaultDatasetPath;
const defaultHybridRecommenderPath = path.resolve(
  projectRoot,
  "../ml_service/recommend_route.py",
);
const configuredHybridRecommenderPath = process.env.HYBRID_RECOMMENDER_PATH
  ? path.resolve(projectRoot, process.env.HYBRID_RECOMMENDER_PATH)
  : defaultHybridRecommenderPath;

export const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  datasetPath: configuredDatasetPath,
  hybridRecommenderPath: configuredHybridRecommenderPath,
  pythonBin: process.env.PYTHON_BIN || "python",
};
