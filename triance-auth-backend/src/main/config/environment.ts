import { EnvUtils } from "../../main/triance-commons";

const environment = {
  // ------------------ SERVER CONFIG ------------------
  port: EnvUtils.getNumber("PORT", 5001),

  // ------------------ CORS SETTINGS ------------------
  allowedOrigins: EnvUtils.getString("ALLOWED_ORIGINS", "*"),
  allowedMethods: EnvUtils.getString(
    "ALLOWED_METHODS",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  ),
  allowedHeaders: EnvUtils.getString(
    "ALLOWED_HEADERS",
    "Content-Type,Authorization,uo-device-type,uo-os,uo-os-version,uo-is-mobile,uo-is-tablet,uo-is-desktop,uo-browser,uo-browser-version"
  ),
  xFrameOptions: EnvUtils.getString("XFRAME_OPTIONS", "DENY"),

  // ------------------ PAYLOAD CONFIG ------------------
  jsonLimit: EnvUtils.getString("JSON_LIMIT", "10kb"),
  allowedFileUploadSize: EnvUtils.getNumber("ALLOWED_FILE_SIZE", 5 * 1024 * 1024),
  fileUploadDirectory: EnvUtils.getString("FILE_UPLOAD_DIRECTORY", "/tmp/"),

  // ------------------ SECURITY CONFIG ------------------
  decryptSensitiveData: EnvUtils.getBoolean("GM_DECRYPT_SENSITIVE_DATA", true),
  cryptoEncryptionKey: EnvUtils.getString("CRYPTO_ENCRYPTION_KEY", "GM@$#&*(!@%^&"),
  secretKey: EnvUtils.getString("GM_SECRET_KEY", "GM_2025"),

  // ------------------ AUTH SETTINGS ------------------
  userLoginExpiryTime: EnvUtils.getNumber("GM_TEACHER_AUTH_TOKEN_EXPIRY_TIME", 8),
  adminLoginExpiryTime: EnvUtils.getNumber("GM_ADMIN_AUTH_TOKEN_EXPIRY_TIME", 8),
  enableRequestResetPasswordDetails: EnvUtils.getBoolean("GM_ENABLE_REQUEST_PASSWORD_MAIL", true),
  enableAdminEmailForgotPwdOtp: EnvUtils.getBoolean("GM_ENABLE_ADMIN_EMAIL_FORGOT_PWD_OTP", true),

  // ------------------ PASSWORD POLICY ------------------
  passwordPolicy: EnvUtils.getString(
    "GM_PASSWORD_POLICY",
    JSON.stringify({
      minimumPasswordLength: 8,
      complexity: 3,
      alphabetical: true,
      numeric: true,
      specialCharacters: true,
      allowedSpecialCharacters: "!@#$%^&*()",
      maximumInvalidAttempts: 50,
    })
  ),

  // ------------------ CLIENT CONFIG ------------------
  clientUrl: EnvUtils.getString("CLIENT_URL", "http://localhost:8100"),

  // ------------------ REDIS CONFIG ------------------
  redisHost: EnvUtils.getString("REDIS_HOST", "localhost"),
  redisPort: EnvUtils.getNumber("REDIS_PORT", 6379),
  redisPassword: EnvUtils.getString("REDIS_PASSWORD", ""),
  redisKeyPrefix: EnvUtils.getString("REDIS_KEY_PREFIX", "dev|triance_ai|"),

  // ------------------ POSTGRES CONFIG ------------------
  postgres: {
    connectionRequired: EnvUtils.getBoolean("INIT_COMMON_PG_DB_REQUIRED", true),
    user: EnvUtils.getString("INIT_COMMON_MASTER_USER", "postgres"),
    password: EnvUtils.getString("INIT_COMMON_MASTER_PASSWORD", "postgres"),
    host: EnvUtils.getString("INIT_COMMON_MASTER_HOST", "localhost"),
    database: EnvUtils.getString("INIT_COMMON_MASTER_DATABASE", "postgres"),
    port: EnvUtils.getNumber("INIT_COMMON_MASTER_PORT", 5432),
    poolSize: EnvUtils.getNumber("INIT_COMMON_PG_POOL_SIZE", 10),
    poolMin: EnvUtils.getNumber("INIT_COMMON_PG_POOL_MIN", 2),
    timeout: EnvUtils.getNumber("INIT_COMMON_PG_TIMEOUT", 10000),
    tlsEnabled: EnvUtils.getBoolean("INIT_COMMON_MASTER_TLS", false),
    tlsPath: EnvUtils.getString("INIT_COMMON_MASTER_TLS_PATH", ""),
  },
};

export { environment };
