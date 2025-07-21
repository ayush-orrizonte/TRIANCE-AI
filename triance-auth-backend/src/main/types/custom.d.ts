import { Status } from "../enums";
import { Document } from "mongoose";
import { UserStatus, AdminStatus } from "../enums/status";

export interface IUser {
  userId: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
  level?: number;
  status: UserStatus;
  invalidLoginAttempts: number;
  lastLoginTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPasswordPolicy {
  minimumPasswordLength: number;
  complexity: number;
  alphabetical: boolean;
  numeric: boolean;
  specialCharacters: boolean;
  allowedSpecialCharacters: string;
  maximumInvalidAttempts: number;
}

export interface IAdmin {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  password: string;
  profile_picture?: string;
  lastLogin_time?: string;
  invalidlogin_attempts: number;
  status: AdminStatus;
  role_id: string;
  level?: string;
}