import { MenuAccess } from "../../../../enums";
import { RolesStatus } from "./rolesListEnum";

// export interface UsersListProps {
//     access: MenuAccess,
//     handleUpdateUser: (userId: number) => void
// };

export interface IRole {
  role_id: number;
  role_name: string;
  role_description: string;
  status: RolesStatus;
}

export interface RolesListProps {
  handleUpdateRole: (roleId: number) => void;
  ref: { current: { refresh: () => void } | null };
  access: MenuAccess;
}

// export interface RolesListProps {
//   handleUpdateRole: (roleId: number) => void;
//   ref: { current: { refresh: () => void } | null };
//   access: MenuAccess;
// }
