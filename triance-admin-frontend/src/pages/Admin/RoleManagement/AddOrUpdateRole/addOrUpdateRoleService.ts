import { ApiResponse, get, post } from "../../../../api";

export const addOrUpdateRoleService = {
  getDefaultAccessList: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/users/defaultAccessList");
  },
  getAccessList: async (roleId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/users/defaultAccessList/${roleId}`);
  },
  getRole: async (roleId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/users/defaultAccessList/${roleId}`);
  },
  addRole: async (
    roleName: string,
    roleDescription: string,
    // level: string,
    permissions: { menuId: string; permissionId: string }[]
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/users/add", {
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
    return await post(`/api/v1/users/update`, {
      roleId: roleId,
      roleName: roleName,
      roleDescription: roleDescription,
      // level,
      permissions,
    });
  },
  listLevels: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/users/list");
  },
};
