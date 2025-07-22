import { RoleStatus } from "../../main/enums/status";
import { IRole } from "../../main/types/custom";

class Role implements IRole {
  role_id: number;
  role_name: string;
  role_description: string;
  status: RoleStatus;
  permissions: any[];
  level?: string | undefined;
  created_by?: number;
  updated_by?: number;

  constructor(role: IRole) {
    this.role_id = role.role_id || 0;
    this.role_name = role.role_name;
    this.role_description = role.role_description || '';
    this.status = role.status || RoleStatus.ACTIVE;
    this.level = role.level || '';
    this.permissions = role.permissions || [];
    this.created_by = role.created_by;
    this.updated_by = role.updated_by;
  }

  isActive(): boolean {
    return this.status === RoleStatus.ACTIVE;
  }

  isArchived(): boolean {
    return this.status === RoleStatus.ARCHIVED;
  }
}

export { Role };