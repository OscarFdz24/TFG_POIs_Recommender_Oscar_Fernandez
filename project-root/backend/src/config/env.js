import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const defaultDatasetPath = path.resolve(projectRoot, "../data/pois_barcelona_procesados.csv");
const configuredDatasetPath = process.env.DATASET_PATH
  ? path.resolve(projectRoot, process.env.DATASET_PATH)
  : defaultDatasetPath;

export const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  datasetPath: configuredDatasetPath,
};
