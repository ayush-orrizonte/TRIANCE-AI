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
    return await post("/api/v1/admin/users/list", payload);
  },
  updateUserStatus: async (
    userId: string,
    status: UserStatus
  ): Promise<ApiResponse<any>> => {
    return await post(`/api/v1/admin/users/updateStatus`, {
      user_id: userId,
      status,
    });
  },
  listRoles: async (
    pageSize: number,
    currentPage: number,
    isActive: boolean
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/roles/list", {
      page_size: pageSize,
      current_page: currentPage,
      is_active: isActive,
    });
  },
  getUser: async (userId: number): Promise<ApiResponse<any>> => {
    return await get(`/api/v1/admin/users/${userId}`);
  },
  addUser: async (
    first_Name: string,
    last_Name: string,
    mobile_number: string,
    email_id: string,
    role_id: any
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/users/create", {
      first_name: first_Name,
      last_name: last_Name,
      mobile_number: mobile_number,
      email_id: email_id,
      role_id: role_id,
    });
  },
  updateUser: async (
    user_id: number,
    firstName: string,
    lastName: string,
    mobileNumber: string,
    email_id: string,

    roleId: number
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/users/update", {
      user_id: user_id,
      first_name: firstName,
      last_name: lastName,
      mobile_number: mobileNumber,
      email_id: email_id,
      role_id: roleId,
    });
  },
};

export default usersListService;
