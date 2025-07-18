import { Status } from "../enums";
import { Document } from "mongoose";
import { UserStatus } from "../enums/status";

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

export interface IAdmin extends Document {
  userId: string;
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  mobileNumber: number;
  emailId: string;
  gender: number;
  dob: string;
  roleId: string;
  level: string;
  password: string;
  invalidAttempts: number;
  status: Status.UserStatus;
  lastLoggedIn: string;
  dateCreated?: string;
  dateUpdated?: string;
  createdBy?: string;
  updatedBy?: string;
  profilePicUrl?: string
}
