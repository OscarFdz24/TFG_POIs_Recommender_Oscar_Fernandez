-- ============================================================
-- 02_create_tables.sql
-- Proyecto: Sistema hibrido de recomendacion de rutas de POIs
-- Objetivo: Crear tablas iniciales para persistencia de rutas.
-- ============================================================

USE pois_recommender_bcn;

-- ------------------------------------------------------------
-- Roles de usuario
-- Ejemplos:
-- - admin: acceso completo
-- - client: hoteles/agencias que pueden crear o asignar rutas
-- - user: usuario final que consulta rutas asignadas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Clientes del sistema
-- Pensado para entidades como hoteles, agencias turisticas, etc.
-- Un usuario con rol client puede pertenecer a un cliente.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  client_type VARCHAR(80) NULL,
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(60) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Usuarios
-- password_hash queda preparado para autenticacion futura.
-- En una primera fase se puede usar un usuario demo.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_users_client
    FOREIGN KEY (client_id) REFERENCES clients(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- POIs
-- Tabla preparada para importar los POIs del dataset hibrido.
-- poi_source_id guarda el id original del dataset.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pois (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  poi_source_id VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NULL,
  subcategory VARCHAR(120) NULL,
  city VARCHAR(120) NOT NULL DEFAULT 'Barcelona',
  description TEXT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  rating DECIMAL(4, 2) NULL,
  score DECIMAL(8, 4) NULL,
  visit_duration_minutes INT UNSIGNED NULL,
  match_confidence DECIMAL(8, 6) NULL,
  cluster_geo INT NULL,
  city_area VARCHAR(120) NULL,
  tags TEXT NULL,
  quality_signal DECIMAL(10, 6) NULL,
  content_base TEXT NULL,
  raw_data JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pois_category (category),
  INDEX idx_pois_subcategory (subcategory),
  INDEX idx_pois_cluster_geo (cluster_geo),
  INDEX idx_pois_city_area (city_area),
  INDEX idx_pois_location (latitude, longitude)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Rutas generadas
-- Guarda preferencias, resumen y respuesta completa del modelo.
-- Esto permite reconstruir la ruta aunque cambie el modelo mas adelante.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'generated',
  generation_mode VARCHAR(80) NOT NULL DEFAULT 'python-hybrid-recommender',
  created_by_user_id BIGINT UNSIGNED NULL,
  assigned_to_user_id BIGINT UNSIGNED NULL,
  client_id BIGINT UNSIGNED NULL,
  start_latitude DECIMAL(10, 7) NOT NULL,
  start_longitude DECIMAL(10, 7) NOT NULL,
  total_pois INT UNSIGNED NOT NULL DEFAULT 0,
  requested_pois INT UNSIGNED NULL,
  total_distance_km DECIMAL(8, 3) NULL,
  total_visit_minutes DECIMAL(8, 2) NULL,
  total_travel_minutes DECIMAL(8, 2) NULL,
  total_experience_minutes DECIMAL(8, 2) NULL,
  avg_candidate_score DECIMAL(10, 6) NULL,
  avg_similarity_score DECIMAL(10, 6) NULL,
  preferences_json JSON NOT NULL,
  summary_json JSON NOT NULL,
  route_json JSON NOT NULL,
  navigation_json JSON NULL,
  model_meta_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_routes_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_routes_assigned_to
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_routes_client
    FOREIGN KEY (client_id) REFERENCES clients(id)
    ON DELETE SET NULL,
  INDEX idx_routes_public_id (public_id),
  INDEX idx_routes_created_by (created_by_user_id),
  INDEX idx_routes_assigned_to (assigned_to_user_id),
  INDEX idx_routes_client (client_id),
  INDEX idx_routes_generation_mode (generation_mode),
  INDEX idx_routes_created_at (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- POIs incluidos en cada ruta
-- Guarda el orden y metricas especificas de ese POI dentro de la ruta.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_pois (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  route_id BIGINT UNSIGNED NOT NULL,
  poi_id BIGINT UNSIGNED NULL,
  poi_source_id VARCHAR(80) NOT NULL,
  route_position INT UNSIGNED NOT NULL,
  name_snapshot VARCHAR(255) NOT NULL,
  category_snapshot VARCHAR(100) NULL,
  subcategory_snapshot VARCHAR(120) NULL,
  latitude_snapshot DECIMAL(10, 7) NOT NULL,
  longitude_snapshot DECIMAL(10, 7) NOT NULL,
  visit_duration_minutes DECIMAL(8, 2) NULL,
  distance_from_start_km DECIMAL(8, 3) NULL,
  distance_from_previous_km DECIMAL(8, 3) NULL,
  hybrid_candidate_score DECIMAL(10, 6) NULL,
  similarity_score DECIMAL(10, 6) NULL,
  quality_signal DECIMAL(10, 6) NULL,
  route_utility DECIMAL(10, 6) NULL,
  poi_data_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_route_pois_route
    FOREIGN KEY (route_id) REFERENCES routes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_route_pois_poi
    FOREIGN KEY (poi_id) REFERENCES pois(id)
    ON DELETE SET NULL,
  UNIQUE KEY uq_route_position (route_id, route_position),
  INDEX idx_route_pois_route (route_id),
  INDEX idx_route_pois_source (poi_source_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Descripciones generadas por LLM
-- Tabla preparada para una fase posterior.
-- No es obligatoria para persistir rutas, pero queda prevista.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS poi_generated_descriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  poi_id BIGINT UNSIGNED NOT NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'es',
  description_type VARCHAR(60) NOT NULL DEFAULT 'touristic',
  generated_text TEXT NOT NULL,
  model_name VARCHAR(120) NULL,
  prompt_version VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_generated_descriptions_poi
    FOREIGN KEY (poi_id) REFERENCES pois(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_poi_description_language_type (poi_id, language_code, description_type)
) ENGINE=InnoDB;
