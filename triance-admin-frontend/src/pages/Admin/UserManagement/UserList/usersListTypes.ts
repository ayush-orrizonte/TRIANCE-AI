import { MenuAccess } from "../../../../enums";
import { UserStatus } from "./usersListEnum";

export interface UsersListProps {
    access: MenuAccess,
    handleUpdateUser: (user_id: number) => void
};

export interface IUser {
  user_id: number;
  user_name: string;
  dob: string;
  gender: number;
  email_id: string;
  first_name: string;
  last_name: string;
  mobile_number: number;
  display_name: string;
  status: UserStatus;
  role_id: number;
  role_name: string;
  // level: Levels
  profile_pic_url: string;
  organization_id: number;
}
