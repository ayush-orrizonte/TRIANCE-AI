import { ApiResponse, post } from "../../../../api";
// import { RolesStatus } from "./rolesListEnum";

const rolesListService = {
  listRoles: async (payload: any): Promise<ApiResponse<any>> => {
    return await post("/api/v1/users/list", payload);
  },
  updateRoleStatus: async (
    role_id: number,
    status: string
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/users/updateStatus`, {
      role_id: role_id,
      status,
    });
  },
};

export default rolesListService;
