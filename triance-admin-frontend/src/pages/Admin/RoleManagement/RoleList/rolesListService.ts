import { ApiResponse, post } from "../../../../api";
// import { RolesStatus } from "./rolesListEnum";

const rolesListService = {
  listRoles: async (payload: any): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/roles/list", payload);
  },
  updateRoleStatus: async (
    role_id: number,
    status: number
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/admin/roles/updateStatus`, {
      role_id: role_id,
      status,
    });
  },
};

export default rolesListService;
