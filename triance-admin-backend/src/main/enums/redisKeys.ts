export enum RedisKeys {
  USER_BY_ID = "user|id:${userId}",
  USERS_LIST = "users",
  USERS_BY_ROLE_ID = "users|role:${roleId}",
  USER_BY_EMAIL = "user|email:${userEmail}",
  USER_RESET_PASSWORD_BY_TXN_ID = "user|reset_password|txnId:${txnId}",
  USERS_COUNT = "users|count",
  USER_BY_USERNAME = "user|username:${username}",
  ROLES = "roles",
  ROLE_BY_ID = "role:${roleId}",
  ACTIVE_ROLES = "roles|active",
  ROLES_COUNT = "roles|count",
  ROLES_LIST = "roles|limit:${pageSize}",
  ACCESS_LIST_BY_ROLE_ID = "access_list|role:${roleId}",
  DEFAULT_ACCESS_LIST = "default_access_list",
  COMBINED_ACCESS_BY_ROLE_ID = "combined_access|role:${roleId}",
  PASSWORD_POLICIES = "password_policies",
  PASSWORD_POLICY_BY_ID = "password_policy:${passwordPolicyId}",
  ADMIN_USER_BY_USER_ID = "admin|user:${userId}",
  MENUS = "menus",
  MENU_BY_ID = "menu:${menu_id}",
  ADMIN_BY_ID = "admin|id:${adminId}",
  ADMINS_LIST = "admins|pageSize:${pageSize}|currentPage:${currentPage}|search:${searchQuery}",
  ADMINS_BY_ROLE_ID = "admins|role:${roleId}",
  ADMIN_BY_EMAIL = "admin|email:${adminEmail}",
  ADMINS_COUNT = "admins|count",
  ADMIN_LOGIN_ATTEMPTS = "admin|login_attempts:id:${adminId}",
  ADMIN_LAST_LOGIN = "admin|last_login:id:${adminId}",
  ADMIN_STATUS = "admin|status:id:${adminId}",
  ADMIN_PROFILE = "admin|profile:id:${adminId}",
}
