import dotenv from "dotenv";
dotenv.config();

type EnvValue = string | number | boolean | undefined;

class EnvUtils {
  /**
   * Get string environment variable
   * @param key Environment variable key
   * @returns string value or undefined if not found
   */
  static getStringEnvVariable(key: string): string | undefined {
    const value = process.env[key];
    return value !== undefined ? value : undefined;
  }

  /**
   * Get number environment variable
   * @param key Environment variable key
   * @returns number value or undefined if not found or invalid
   */
  static getNumberEnvVariable(key: string): number | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    const parsedNumber = parseFloat(value);
    return isNaN(parsedNumber) ? undefined : parsedNumber;
  }

  /**
   * Get boolean environment variable
   * @param key Environment variable key
   * @returns boolean value or undefined if not found or invalid
   */
  static getBooleanEnvVariable(key: string): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    const lowercaseValue = value.toLowerCase();
    return lowercaseValue === 'true' || lowercaseValue === 'false'
      ? lowercaseValue === 'true'
      : undefined;
  }

  /**
   * Require string environment variable (throws if missing)
   * @param key Environment variable key
   * @returns string value
   * @throws Error if variable is not set
   */
  static requireStringEnvVariable(key: string): string {
    const value = this.getStringEnvVariable(key);
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
  }

  /**
   * Require number environment variable (throws if missing or invalid)
   * @param key Environment variable key
   * @returns number value
   * @throws Error if variable is not set or invalid
   */
  static requireNumberEnvVariable(key: string): number {
    const value = this.getNumberEnvVariable(key);
    if (value === undefined) {
      throw new Error(
        `Environment variable ${key} is required but not set or not a valid number.`
      );
    }
    return value;
  }

  /**
   * Require boolean environment variable (throws if missing or invalid)
   * @param key Environment variable key
   * @returns boolean value
   * @throws Error if variable is not set or invalid
   */
  static requireBooleanEnvVariable(key: string): boolean {
    const value = this.getBooleanEnvVariable(key);
    if (value === undefined) {
      throw new Error(
        `Environment variable ${key} is required but not set or not a valid boolean.`
      );
    }
    return value;
  }

  /**
   * Get string environment variable with fallback to default value
   * @param key Environment variable key
   * @param defaultValue Default value if key not found
   * @returns string value or defaultValue if not found
   */
  static getStringEnvVariableOrDefault(key: string, defaultValue: string): string {
    const value = this.getStringEnvVariable(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get number environment variable with fallback to default value
   * @param key Environment variable key
   * @param defaultValue Default value if key not found or invalid
   * @returns number value or defaultValue if not found or invalid
   */
  static getNumberEnvVariableOrDefault(key: string, defaultValue: number): number {
    const value = this.getNumberEnvVariable(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get boolean environment variable with fallback to default value
   * @param key Environment variable key
   * @param defaultValue Default value if key not found or invalid
   * @returns boolean value or defaultValue if not found or invalid
   */
  static getBooleanEnvVariableOrDefault(key: string, defaultValue: boolean): boolean {
    const value = this.getBooleanEnvVariable(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Check if current environment is production
   * @returns boolean
   */
  static isProduction(): boolean {
    return this.getStringEnvVariableOrDefault('NODE_ENV', 'development').toLowerCase() === 'production';
  }

  /**
   * Check if current environment is development
   * @returns boolean
   */
  static isDevelopment(): boolean {
    return !this.isProduction();
  }
  static getString(key: string, defaultValue?: string): string {
  return this.getStringEnvVariableOrDefault(key, defaultValue ?? "");
}

static getNumber(key: string, defaultValue?: number): number {
  return this.getNumberEnvVariableOrDefault(key, defaultValue ?? 0);
}

static getBoolean(key: string, defaultValue?: boolean): boolean {
  return this.getBooleanEnvVariableOrDefault(key, defaultValue ?? false);
}

}

export default EnvUtils;
export { EnvUtils };