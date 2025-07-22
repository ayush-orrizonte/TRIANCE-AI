import { ApiResponse, post } from "../../../../api";
import { RolesStatus } from "./rolesListEnum";

const rolesListService = {
  listRoles: async (payload: any): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/roles/list", payload);
  },
  updateRoleStatus: async (
    roleId: number,
    status: string
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/admin/roles/updateStatus`, {
      roleId: roleId,
      status,
    });
  },
};

export default rolesListService;
