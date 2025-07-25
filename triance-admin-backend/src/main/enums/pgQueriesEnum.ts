export enum UserQueries {
  USERS_LIST = `SELECT * from vw_m_users WHERE status <> 2`,
  LATEST_UPDATED_CHECK = `SELECT COUNT(*) as count FROM vw_m_users WHERE date_updated >= NOW() - INTERVAL '5 minutes'`,
  GET_USER_BY_ID = `SELECT * from  m_users WHERE user_id = $1 AND status <> 2`,
  UPDATE_USER_STATUS = `UPDATE m_users SET status = $2, updated_by = $3, date_updated = NOW() WHERE user_id = $1`,
  EXISTS_BY_MOBILE_NUMBER = `SELECT EXISTS (SELECT 1 FROM m_users WHERE mobile_number = $1 AND status <> 2)`,
  EXISTS_BY_USER_ID = `SELECT EXISTS (SELECT 1 FROM m_users WHERE user_id = $1)`,
  CREATE_USER = `INSERT INTO m_users(user_name, first_name, last_name, display_name, dob, gender, mobile_number, password, role_id, email_id, created_by, updated_by, date_created, date_updated)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING user_id`,
  UPDATE_USER = `UPDATE m_users SET first_name = $2, last_name = $3, dob = $4, gender = $5, email_id = $6, updated_by = $7, role_id = $8, display_name = $9, date_updated = NOW() WHERE user_id = $1`,
  GET_USERS_BY_ROLE_ID = `SELECT user_id, user_name, initcap(display_name) as display_name, mobile_number from m_users where role_id = $1 AND status <> 2`,
  RESET_PASSWORD_FOR_USER_ID = `UPDATE m_users SET password = $2, password_last_updated = NOW(), date_updated = NOW() WHERE user_id = $1`,
  USERS_COUNT = `SELECT count(*) as count from vw_m_users WHERE status <> 2`,
}

export enum AdminQueries {
  CREATE_ADMIN = `INSERT INTO m_admin(
  admin_name, admin_email, password,  
  invalid_login_attempts, status, role_id, level
) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING admin_id`,

ADMINS_LIST = `
SELECT 
  admin_id, admin_name, admin_email, 
  invalid_login_attempts, status, role_id, level 
  FROM m_admin 
  WHERE status IN (1, 2,3)
  ORDER BY admin_name
  `,

GET_ADMIN_BY_ID = `SELECT 
    admin_id, admin_name, admin_email, 
    invalid_login_attempts, status, role_id, level 
  FROM m_admin 
  WHERE admin_id = $1`,

UPDATE_ADMIN_STATUS = `UPDATE m_admin 
SET status = $1 
WHERE admin_id = $2 
RETURNING admin_id, status`,

EXISTS_BY_ADMIN_ID = `
  SELECT EXISTS (
    SELECT 1 FROM m_admin WHERE admin_id = $1
  ) AS exists
`,


UPDATE_ADMIN = `UPDATE m_admin 
SET 
  admin_name = $1, 
  admin_email = $2, 
  role_id = $3, 
  level = $4 
WHERE admin_id = $5 
RETURNING admin_id`,

GET_ADMIN_BY_ROLE_ID = `SELECT 
  admin_id, admin_name, admin_email, 
  invalid_login_attempts, status, role_id, level 
FROM m_admin 
WHERE role_id = $1 
ORDER BY admin_name`,
RESET_PASSWORD_FOR_ADMIN_ID = `UPDATE m_admin
SET password = $1
WHERE admin_id = $2
RETURNING admin_id`,
ADMINS_COUNT = `SELECT COUNT(admin_id) FROM m_admin WHERE status IN (1, 2, 3)`
}

export enum MenuQueries {
  ADD_MENU = `INSERT INTO m_menus(menu_name, menu_description, status, menu_order, route_url, icon_class, date_created, date_updated)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
  EXISTS_BY_MENU_NAME = `SELECT EXISTS (SELECT 1 FROM m_menus WHERE menu_name = $1 AND status <> 2)`,
  EXISTS_BY_MENU_ID = `SELECT EXISTS (SELECT 1 FROM m_menus WHERE menu_id = $1 AND status <> 2)`,
  UPDATE_MENU = `UPDATE m_menus SET menu_name = $2, menu_description = $3, status = $4, menu_order = $5, route_url = $6, icon_class = $7, date_updated = NOW() WHERE menu_id = $1`,
  GET_MENU_BY_ID = `SELECT menu_name, menu_description, status, menu_order, route_url, icon_class, date_created, date_updated FROM m_menus WHERE menu_id = $1 AND status <> 2`,
  LIST_MENUS = `SELECT menu_id, menu_name, menu_description, status, menu_order, route_url, icon_class FROM m_menus WHERE status <> 2 ORDER BY menu_order, date_updated DESC`,
  UPDATE_MENU_STATUS = `UPDATE m_menus SET status = $2, date_updated = NOW() WHERE menu_id = $1`,
}

export enum PasswordPolicyQueries {
  ADD_PASSWORD_POLICY = `INSERT INTO password_policies(password_expiry, password_history, minimum_password_length, complexity, alphabetical, "numeric", special_characters, allowed_special_characters, maximum_invalid_attempts, date_created, date_updated)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
  LIST_PASSWORD_POLICIES = `SELECT id, password_expiry, password_history, minimum_password_length, complexity, alphabetical, numeric, special_characters, allowed_special_characters, maximum_invalid_attempts FROM password_policies ORDER BY date_updated DESC`,
  UPDATE_PASSWORD_POLICY = `UPDATE password_policies SET password_expiry = $2, password_history = $3, minimum_password_length = $4, complexity = $5, alphabetical = $6, numeric = $7, special_characters = $8, allowed_special_characters = $9, maximum_invalid_attempts = $10, date_updated = NOW() WHERE id = $1`,
  EXISTS_BY_PASSWORD_POLICY_ID = `SELECT EXISTS (SELECT 1 FROM password_policies WHERE id = $1)`,
  GET_PASSWORD_POLICY_BY_ID = `SELECT password_expiry, password_history, minimum_password_length, complexity, alphabetical, numeric, special_characters, allowed_special_characters, maximum_invalid_attempts FROM password_policies WHERE id = $1`,
}

export enum RoleQueries { 
  LIST_ROLES = `
  SELECT role_id, role_name, role_description, status
FROM m_roles
WHERE status IN(1,2)
  AND role_name ILIKE $1
ORDER BY role_id
LIMIT $2 OFFSET $3
`,
  LIST_ROLES_COUNT = `
  SELECT count(*) AS count
  FROM m_roles
  WHERE status IN (1, 2)
    AND role_name ILIKE $1
`,
  UPDATE_ROLE = "UPDATE m_roles SET role_name = $2, role_description = $3, level = $4, updated_by = $5, date_updated = NOW() WHERE role_id = $1",
  GET_ROLE = "SELECT role_name, role_description, level, status FROM m_roles WHERE role_id = $1 AND status IN ( 1,2)",
  UPDATE_ROLE_STATUS = "UPDATE m_roles SET status = $2, updated_by = $1, date_updated = NOW() WHERE role_id = $3",
  EXISTS_BY_ROLE_ID = `SELECT EXISTS (SELECT 1 FROM m_roles WHERE role_id = $1 AND status IN (1,2))`,
  EXISTS_BY_ROLE_NAME = `SELECT EXISTS (SELECT 1 FROM m_roles WHERE role_name = $1 AND status = 1)`,
  ADD_ROLE = "INSERT INTO m_roles (role_name, role_description, level, status, created_by, updated_by, date_created, date_updated) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING role_id",
  ADD_PERMISSIONS = "INSERT INTO access_control (role_id, menu_id, permission_id, created_by, updated_by) values($1, $2, $3, $4, $4)",
  DELETE_EXISTING_PERMISSIONS = "DELETE from access_control where role_id = $1",
  GET_MENUS_LIST = `SELECT menu_id, menu_name AS label, route_url as link, icon_class as icon, status, 'true' as initiallyOpened from m_menus`,
  GET_DEFAULT_ACCESS_LIST = `SELECT
    mm.menu_id,
    mm.menu_name,
    mm.route_url,
    mm.icon_class,
    mp.permission_id,
    mp.permission_name
FROM m_menus AS mm
CROSS JOIN m_permissions AS mp
WHERE mm.status = 1
ORDER BY mm.menu_id, mp.permission_id;
`,
  GET_ACCESS_LIST_BY_ROLE_ID = `SELECT mm.menu_id, mm.menu_name, mm.route_url, mm.icon_class,
                               sum(CASE WHEN (ac.permission_id) = 1 THEN 1 ELSE 0 END) write_permission,
                               sum(CASE WHEN (ac.permission_id) = 2 THEN 1 ELSE 0 END) read_permission,
                               (CASE WHEN sum(COALESCE(ac.permission_id, 0)) > 0 THEN 1 ELSE 0 END) display_permission
                               FROM m_menus mm
                               LEFT OUTER JOIN access_control ac ON mm.menu_id = ac.menu_id AND ac.role_id=$1
                               LEFT OUTER JOIN m_permissions mp ON ac.permission_id = mp.permission_id
                               WHERE mm.status=1
                               GROUP BY mm.menu_id, mm.menu_name, mm.route_url, mm.icon_class, mm.menu_order
                               ORDER BY mm.menu_order ASC`,

  GET_COMBINED_ACCESS_BY_ROLE_ID = `
        SELECT 
            m.menu_name,
            m.icon_class,
            m.route_url,
            p.permission_name AS access
        FROM 
            access_control ac
        JOIN 
            m_menus m ON ac.menu_id = m.menu_id
        JOIN 
            m_permissions p ON ac.permission_id = p.permission_id
        WHERE 
            ac.role_id = $1
        ORDER BY 
            m.menu_order ASC, 
            m.date_created ASC;
    `
}