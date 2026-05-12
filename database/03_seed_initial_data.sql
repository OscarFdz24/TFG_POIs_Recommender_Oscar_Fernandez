-- ============================================================
-- 03_seed_initial_data.sql
-- Proyecto: Sistema hibrido de recomendacion de rutas de POIs
-- Objetivo: Insertar datos iniciales minimos.
-- ============================================================

USE pois_recommender_bcn;

-- Roles basicos
INSERT INTO roles (code, name, description)
VALUES
  ('admin', 'Administrador', 'Usuario con acceso completo al sistema.'),
  ('client', 'Cliente', 'Cliente del sistema, por ejemplo un hotel o agencia.'),
  ('user', 'Usuario final', 'Usuario final que consulta rutas asignadas.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- Cliente demo
INSERT INTO clients (name, client_type, contact_email, notes)
VALUES (
  'Hotel Demo Barcelona',
  'hotel',
  'demo.hotel@example.com',
  'Cliente demo para pruebas iniciales de asignacion de rutas.'
);

-- Usuarios demo
-- Nota: password_hash queda a NULL porque la autenticacion se definira mas adelante.
INSERT INTO users (role_id, client_id, name, email, password_hash)
SELECT r.id, NULL, 'Admin Demo', 'admin.demo@example.com', NULL
FROM roles r
WHERE r.code = 'admin'
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role_id = VALUES(role_id);

INSERT INTO users (role_id, client_id, name, email, password_hash)
SELECT r.id, c.id, 'Cliente Demo Hotel', 'cliente.demo@example.com', NULL
FROM roles r
CROSS JOIN clients c
WHERE r.code = 'client'
  AND c.name = 'Hotel Demo Barcelona'
ORDER BY c.id DESC
LIMIT 1
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role_id = VALUES(role_id),
  client_id = VALUES(client_id);

INSERT INTO users (role_id, client_id, name, email, password_hash)
SELECT r.id, c.id, 'Usuario Demo', 'usuario.demo@example.com', NULL
FROM roles r
CROSS JOIN clients c
WHERE r.code = 'user'
  AND c.name = 'Hotel Demo Barcelona'
ORDER BY c.id DESC
LIMIT 1
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role_id = VALUES(role_id),
  client_id = VALUES(client_id);
