import { ApiResponse, get, post } from "../../../../api";

export const addOrUpdateRoleService = {
  getDefaultAccessList: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/roles/defaultAccessList");
  },
  getAccessList: async (roleId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/roles/accessList/${roleId}`);
  },
  getRole: async (roleId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/roles/${roleId}`);
  },
  addRole: async (
    roleName: string,
    roleDescription: string,
    // level: string,
    permissions: { menuId: string; permissionId: string }[]
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/roles/add", {
      roleName: roleName,
      roleDescription: roleDescription,
      // level,
      permissions,
    });
  },
  updateRole: async (
    roleId: number,
    roleName: string,
    roleDescription: string,
    // level: string,
    permissions: { menuId: string; permissionId: string }[]
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/admin/roles/update`, {
      roleId: roleId,
      roleName: roleName,
      roleDescription: roleDescription,
      // level,
      permissions,
    });
  },
  listLevels: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/roles/listLevels");
  },
};
