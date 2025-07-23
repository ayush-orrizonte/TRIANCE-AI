import { MenuAccess } from "../../../../enums";
import { UserStatus } from "./usersListEnum";

export interface UsersListProps {
  access: MenuAccess;
  handleUpdateUser: (user_id: number) => void;
}
export interface IUser {
  admin_id: number;
  userName: string;
  dob: string;
  gender: number;
  emailId: string;
  firstName: string;
  lastName: string;
  mobileNumber: number;
  displayName: string;
  status: UserStatus;
  roleId: number;
  roleName: string;
  // level: Levels
  profilePicUrl: string;
  organization_id: number;
}