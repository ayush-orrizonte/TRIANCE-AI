
import { AdminStatus } from "../enums/status";
import { IAdmin } from "../types/custom";

class Admin implements IAdmin {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  password: string;
  invalidlogin_attempts: number;
  status: AdminStatus;
  role_id: number;
  level: string;

  constructor(admin: IAdmin) {
    this.admin_id = admin.admin_id ;
    this.admin_name = admin.admin_name;
    this.admin_email = admin.admin_email;
    this.password = admin.password;
    this.invalidlogin_attempts = admin.invalidlogin_attempts || 0;
    this.status = admin.status ?? AdminStatus.ACTIVE;
    this.role_id = admin.role_id;
    this.level = admin.level || "";
  }
}

export { Admin };


