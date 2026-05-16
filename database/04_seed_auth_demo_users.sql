-- ------------------------------------------------------------
-- 04_seed_auth_demo_users.sql
-- Usuarios demo preparados para probar registro/login.
--
-- Password de prueba para todos:
--   demo1234
--
-- Importante:
-- La password NO se guarda en texto plano. Se guarda como hash bcrypt.
-- Cuando implementemos el login, el backend comparara la password escrita
-- por el usuario con este hash.
-- ------------------------------------------------------------

USE pois_recommender_bcn;

-- Asegura que existe una empresa demo generica.
-- Como la tabla clients no tiene UNIQUE por email, primero actualizamos
-- si existe y despues insertamos solo si no hay ninguna empresa con ese email.
UPDATE clients
SET name = 'Empresa Demo',
    client_type = 'empresa',
    notes = 'Cliente/empresa demo para probar el flujo de creacion y asignacion de rutas.'
WHERE contact_email = 'empresa.demo@example.com';

INSERT INTO clients (name, client_type, contact_email, notes)
SELECT
  'Empresa Demo',
  'empresa',
  'empresa.demo@example.com',
  'Cliente/empresa demo para probar el flujo de creacion y asignacion de rutas.'
WHERE NOT EXISTS (
  SELECT 1
  FROM clients
  WHERE contact_email = 'empresa.demo@example.com'
);

-- Hash bcrypt de la password: demo1234
-- Generado con bcrypt usando salt rounds = 10.
SET @demo_password_hash = '$2b$10$rNyvSFZQ8DoVTS.h6yjjEuo0zL3jkl9bfwqfgHbCY7V/wdf9Addra';

-- Usuario administrador.
INSERT INTO users (role_id, client_id, name, email, password_hash, is_active)
SELECT r.id, NULL, 'Admin Demo', 'admin.demo@example.com', @demo_password_hash, TRUE
FROM roles r
WHERE r.code = 'admin'
ON DUPLICATE KEY UPDATE
  role_id = VALUES(role_id),
  client_id = VALUES(client_id),
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  is_active = VALUES(is_active);

-- Usuario empresa/cliente.
INSERT INTO users (role_id, client_id, name, email, password_hash, is_active)
SELECT r.id, c.id, 'Empresa Demo', 'empresa.demo@example.com', @demo_password_hash, TRUE
FROM roles r
CROSS JOIN clients c
WHERE r.code = 'client'
  AND c.contact_email = 'empresa.demo@example.com'
ORDER BY c.id DESC
LIMIT 1
ON DUPLICATE KEY UPDATE
  role_id = VALUES(role_id),
  client_id = VALUES(client_id),
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  is_active = VALUES(is_active);

-- Usuario final.
INSERT INTO users (role_id, client_id, name, email, password_hash, is_active)
SELECT r.id, c.id, 'Usuario Demo', 'usuario.demo@example.com', @demo_password_hash, TRUE
FROM roles r
CROSS JOIN clients c
WHERE r.code = 'user'
  AND c.contact_email = 'empresa.demo@example.com'
ORDER BY c.id DESC
LIMIT 1
ON DUPLICATE KEY UPDATE
  role_id = VALUES(role_id),
  client_id = VALUES(client_id),
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  is_active = VALUES(is_active);

-- Opcional: tambien actualiza el usuario demo antiguo de cliente/hotel,
-- por si ya lo tenias creado desde el seed inicial y quieres usarlo.
UPDATE users
SET password_hash = @demo_password_hash,
    is_active = TRUE
WHERE email = 'cliente.demo@example.com';

-- Comprobacion rapida.
SELECT
  u.id,
  r.code AS role_code,
  u.name,
  u.email,
  CASE
    WHEN u.password_hash IS NULL THEN 'SIN PASSWORD'
    ELSE 'PASSWORD BCRYPT OK'
  END AS password_status,
  u.is_active
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.email IN (
  'admin.demo@example.com',
  'empresa.demo@example.com',
  'usuario.demo@example.com',
  'cliente.demo@example.com'
)
ORDER BY u.id;
