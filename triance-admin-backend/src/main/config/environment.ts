import EnvUtils from "../../main/triance-commons/src/config/envUtils";

const environment = {
  port: EnvUtils.getNumberEnvVariableOrDefault("PORT", 5003),
  allowedOrigins: EnvUtils.getStringEnvVariableOrDefault("ALLOWED_ORIGINS", "*"),
  allowedFileUploadSize: EnvUtils.getNumberEnvVariableOrDefault("ALLOWED_FILE_SIZE", 5 * 1024 * 1024),
  allowedMethods: EnvUtils.getStringEnvVariableOrDefault("ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"),
  allowedHeaders: EnvUtils.getStringEnvVariableOrDefault(
    "ALLOWED_HEADERS",
    "Content-Type,Authorization,uo-device-type,uo-os,uo-os-version,uo-is-mobile,uo-is-tablet,uo-is-desktop,uo-browser,uo-browser-version"
  ),
  xFrameOptions: EnvUtils.getStringEnvVariableOrDefault("XFRAME_OPTIONS", "DENY"),
  jsonLimit: EnvUtils.getStringEnvVariableOrDefault("JSON_LIMIT", "10mb"),
  fileUploadDirectory: EnvUtils.getStringEnvVariableOrDefault("FILE_UPLOAD_DIRECTORY", "/tmp/"),
  decryptSensitiveData: EnvUtils.getBooleanEnvVariableOrDefault("GM_DECRYPT_SENSITIVE_DATA", true),
  cryptoEncryptionKey: EnvUtils.getStringEnvVariableOrDefault("CRYPTO_ENCRYPTION_KEY", "GM@$#&*(!@%^&"),
  teacherLoginExpiryTime: EnvUtils.getNumberEnvVariableOrDefault("GM_TEACHER_AUTH_TOKEN_EXPIRY_TIME", 8),
  enableRequestResetPasswordDetails: EnvUtils.getBooleanEnvVariableOrDefault("GM_ENABLE_REQUEST_PASSWORD_MAIL", true),
  passwordPolicy: EnvUtils.getStringEnvVariableOrDefault(
    "TRIANCE_PASSWORD_POLICY",
    JSON.stringify({
      minimumPasswordLength: 8,
      complexity: 3,
      alphabetical: true,
      numeric: true,
      specialCharacters: true,
      allowedSpecialCharacters: "!@#$%^&*()",
      maximumInvalidAttempts: 5,
    })
  ),
};

export { environment };
