export enum RedisKeys { 
  USER_BY_ID = "user|id:${userId}",
  USER_BY_EMAIL = "user|email:${userEmail}",
  USER_RESET_PASSWORD_BY_TXN_ID = "user|reset_password|txnId:${txnId}",
  FORGOT_PASSWORD_USER_DETAILS_BY_EMAIL = "forgot_password|email:${email}",
  FORGOT_PASSWORD_DETAILS_BY_TXNID = "forgot_password|txnId:${txnId}",
  FORGOT_PASSWORD_CHANGE_BY_TXNID = "forgot_password_change|txnId:${txnId}",
  USER_BY_USERNAME = "user|username:${username}",  
  ADMIN_RESET_PASSWORD_BY_TXN_ID = "admin|reset_password|txnId:${txn_id}", 
  ADMIN_BY_EMAIL = "admin|email:${admin_email}",
  ADMIN_BY_ID = "admin|id:${admin_id}",
  ADMIN_BY_ROLE_ID = "admin|role_id:${role_id}",
}
