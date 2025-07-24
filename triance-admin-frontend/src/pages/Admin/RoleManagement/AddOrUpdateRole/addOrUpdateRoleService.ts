import { ApiResponse, get, post } from "../../../../api";

export const addOrUpdateRoleService = {
  getDefaultAccessList: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/roles/defaultAccessList");
  },
  getAccessList: async (roleId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/roles/combinedAccess/${roleId}`);
  },
  getRole: async (): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/roles/list`);
  },


addRole: async (
  roleName: string,
  roleDescription: string,
  level: string, // <--- Add this
  permissions: { menuId: number; permissionId: number }[]
): Promise<ApiResponse<any>> => {
  const payload = {
    role_name: roleName,
    role_description: roleDescription,
    level: level,
    permissions: permissions.map(p => ({
      menu_id: Number(p.menuId),
      permission_id: Number(p.permissionId),
    })),
  };

  return await post("/api/v1/admin/roles/add", payload);
},

updateRole: async (
  roleId: number,
  roleName: string,
  roleDescription: string,
  level: string,
  permissions: { menuId: number; permissionId: number }[] 
): Promise<ApiResponse<any>> => {
   const payload = {
     role_id: roleId,
    role_name: roleName,
    role_description: roleDescription,
    level: level,
    permissions: permissions.map(p => ({
      menu_id: Number(p.menuId),
      permission_id: Number(p.permissionId),
    })),
  };

  return await post("/api/v1/admin/roles/update", payload);

    
  },

  listLevels: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/roles/list");
  }
};
