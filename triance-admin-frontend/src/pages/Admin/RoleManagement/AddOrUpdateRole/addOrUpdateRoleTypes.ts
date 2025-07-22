import { MenuAccess } from "../../../../enums";

export interface AddOrUpdateRoleProps {
  roleId: number | null;
  close: () => void;
  listRoles: () => void;
}

export interface IDefaultAccess {
  menu_id: number;
  menu_name: string;
  route_url: string;
  icon_class: string;
  permission_id: 1;
  permission_name: MenuAccess;
}

export interface IAccess {
  menu_id: number;
  menu_name: string;
  route_url: string;
  icon_class: string;
  write_permission: "0" | "1";
  read_permission: "0" | "1";
  display_permission: number;
}
