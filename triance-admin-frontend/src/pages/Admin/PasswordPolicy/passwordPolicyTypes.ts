export interface IPasswordPolicy {
  id: number;
  passwordExpiry: number;
  passwordHistory: number;
  complexity: number;
  passwordLength: number;
  allowedSpecialCharacters: string;
  invalidAttempts: number;
  alphabetical: boolean;
  numeric: boolean;
  specialCharacters: boolean;
}