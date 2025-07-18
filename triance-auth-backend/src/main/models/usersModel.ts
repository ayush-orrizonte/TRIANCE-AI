import { UserStatus } from "../enums/status";
import { IUser } from "../types/custom";

export class User {
  userId: string;
  username: string;
  email: string;
  password: string;
  lastLoginTime: Date;
  invalidLoginAttempts: number;
  status: UserStatus;

  constructor(user: IUser) {
    this.userId = user.userId;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.lastLoginTime = user.lastLoginTime || new Date();
    this.invalidLoginAttempts = user.invalidLoginAttempts || 0;
    this.status = user.status || UserStatus.ACTIVE;
  }
}