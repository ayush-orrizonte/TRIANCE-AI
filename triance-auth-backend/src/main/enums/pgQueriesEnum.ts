export enum adminQueries {
  GET_ADMIN_BY_EMAIL = `
    SELECT 
      admin_id, admin_name, admin_email, password, role_id, 
      level, status, invalid_login_attempts
    FROM m_admin
    WHERE admin_email = $1 
      AND status NOT IN ($2, $3)
  `,

  GET_ADMIN_BY_ID = `
    SELECT 
      admin_id, admin_name, admin_email, role_id, 
      level, status, invalid_login_attempts
    FROM m_admin
    WHERE admin_id = $1 
      AND status NOT IN ($2, $3)
  `,

  INCREMENT_INVALID_LOGIN = `
    UPDATE m_admin
    SET invalid_login_attempts = invalid_login_attempts + 1
    WHERE admin_email = $1
    RETURNING invalid_login_attempts
  `,

  /** ? Reset Invalid Login Attempts */
  RESET_INVALID_LOGIN = `
    UPDATE m_admin
    SET invalid_login_attempts = 0
    WHERE admin_email = $1
    RETURNING invalid_login_attempts
  `,

  UPDATE_ADMIN_STATUS = `
    UPDATE m_admin
    SET status = $1
    WHERE admin_email = $2
    RETURNING admin_id, status
  `,

  RESET_PASSWORD = `
    UPDATE m_admin
    SET password = $1
    WHERE admin_id = $2
    RETURNING admin_id
  `,
  LIST_ACTIVE_ADMINS = `
    SELECT 
      admin_id, admin_name, admin_email, role_id, 
      level, status
    FROM m_admin
    WHERE status = $1
    ORDER BY admin_name
  `
}

