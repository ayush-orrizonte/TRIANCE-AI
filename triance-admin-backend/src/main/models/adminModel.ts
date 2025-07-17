import { v4 as uuidv4 } from "uuid";
import { AdminStatus } from "../enums/status";
import { IAdmin } from "../types/custom";

class Admin implements IAdmin {
  admin_id: string;
  admin_name: string;
  admin_email: string;
  password: string;
  profile_picture: string;
  lastLogin_time: string;
  invalidlogin_attempts: number;
  status: AdminStatus;
  role_id: string;
  level: string;

  constructor(admin: IAdmin) {
    this.admin_id = admin.admin_id || uuidv4();
    this.admin_name = admin.admin_name;
    this.admin_email = admin.admin_email;
    this.password = admin.password;
    this.profile_picture = admin.profile_picture || "";
    this.lastLogin_time = admin.lastLogin_time || new Date().toISOString();
    this.invalidlogin_attempts = admin.invalidlogin_attempts || 0;
    this.status = admin.status ?? AdminStatus.ACTIVE;
    this.role_id = admin.role_id || "";
    this.level = admin.level || "";
  }
}

export { Admin };


