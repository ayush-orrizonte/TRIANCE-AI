import { MenuStatus } from "../enums/menusEnums";
import { UserStatus, Rolestatus} from "../enums/status";


export interface IMenu {
  menu_id: number;
  menu_name: string;
  menu_description: string;
  status: MenuStatus;
  menu_order: number;
  route_url: string;
  icon_class: string;
  date_created: string | undefined;
  date_updated: string | undefined;
}

export interface IPasswordPolicy {
  id?: number;
  password_expiry?: number;
  password_history?: number;
  minimum_password_length: number;
  complexity: number;
  alphabetical: boolean; 
  numeric: boolean;      
  special_characters: boolean; 
  allowed_special_characters: string;
  maximum_invalid_attempts: number;
  date_created?: string;
  date_updated?: string;
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
  role_id: number;
  level?: string;
}

export interface IUser {
  user_id: string;
  user_name: string;
  display_name: string;
  first_name: string;
  last_name: string;
  mobile_number: number;
  email_id: string;
  role_id: string;
  password: string;
  invalid_attempts: string;
  status: UserStatus;
  last_logged_in: string;
  date_created?: string;
  date_updated?: string;
  created_by?: string;
  updated_by?: string;
}

export interface IRole {
  role_id: number;
  role_name: string;
  role_description: string;
  status: RoleStatus;
  level?: string;
  permissions: any;
  created_by?: number | undefined;
  updated_by?: number | undefined;
}

