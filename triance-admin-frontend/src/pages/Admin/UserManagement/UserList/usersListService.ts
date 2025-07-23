import { string } from "yup";
import { ApiResponse, get, post } from "../../../../api";
import { UserStatus } from "./usersListEnum";

const usersListService = {
  listUsers: async (
    currentPage: number,
    pageSize: number,
    searchQuery?: string
  ): Promise<ApiResponse<any>> => {
    const payload = {
      page_size: pageSize,
      page_number: currentPage,
      search_query: searchQuery || undefined,
    };
    return await post("/api/v1/admin/list", payload);
  },
  updateUserStatus: async (
    admin_id: number,
    status: UserStatus
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/admin/updateStatus`, {
      admin_id: admin_id,
      status,
    });
  },
  listRoles: async (
    pageSize: number,
    currentPage: number,
    isActive: boolean
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/users/list", {
      page_size: pageSize,
      current_page: currentPage,
      is_active: isActive,
    });
  },
  getUser: async (adminId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/${adminId}`);
  },
  addUser: async (
    admin_name: string,
    level: string,
    admin_email: string,
    role_id: number
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/create", {
      admin_name: admin_name,
      level: level,
      admin_email: admin_email,
      role_id: role_id,
    });
  },
  updateUser: async (
    role_id: number,
    admin_name: string,
    admin_email: string,
    admin_id: number,
    level: string
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/update", {
      admin_name: admin_name,
      level: level,
      admin_email: admin_email,
      role_id: role_id,
      admin_id: admin_id,
    });
  },
};

export default usersListService;
