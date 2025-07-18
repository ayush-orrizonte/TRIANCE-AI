import { EnvUtils } from "../../main/triance-commons";

const environment = {
  port: EnvUtils.getNumber("PORT", 5001),
  allowedOrigins: EnvUtils.getString("ALLOWED_ORIGINS", "*"),
  allowedFileUploadSize: EnvUtils.getNumber(
    "ALLOWED_FILE_SIZE",
    5 * 1024 * 1024
  ),
  allowedMethods: EnvUtils.getString(
    "ALLOWED_METHODS",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  ),
  allowedHeaders: EnvUtils.getString(
    "ALLOWED_HEADERS",
    "Content-Type,Authorization,uo-device-type,uo-os,uo-os-version,uo-is-mobile,uo-is-tablet,uo-is-desktop,uo-browser,uo-browser-version"
  ),
  xFrameOptions: EnvUtils.getString("XFRAME_OPTIONS", "DENY"),
  jsonLimit: EnvUtils.getString("JSON_LIMIT", "10kb"),
  fileUploadDirectory: EnvUtils.getString("FILE_UPLOAD_DIRECTORY", "/tmp/"),
  decryptSensitiveData: EnvUtils.getBoolean("GM_DECRYPT_SENSITIVE_DATA", true),
  cryptoEncryptionKey: EnvUtils.getString(
    "CRYPTO_ENCRYPTION_KEY",
    "GM@$#&*(!@%^&"
  ),
  userLoginExpiryTime: EnvUtils.getNumber(
    "GM_TEACHER_AUTH_TOKEN_EXPIRY_TIME",
    8
  ),
  enableRequestResetPasswordDetails: EnvUtils.getBoolean(
    "GM_ENABLE_REQUEST_PASSWORD_MAIL",
    true
  ),
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
  adminLoginExpiryTime: EnvUtils.getNumber(
    "GM_ADMIN_AUTH_TOKEN_EXPIRY_TIME",
    8
  ),
  secretKey: EnvUtils.getString("GM_SECRET_KEY", "GM_2025"),
  clientUrl: EnvUtils.getString("CLIENT_URL", "http://localhost:8100"),
  enableAdminEmailForgotPwdOtp: EnvUtils.getBoolean(
    "GM_ENABLE_ADMIN_EMAIL_FORGOT_PWD_OTP",
    true
  ),
};

export { environment };
