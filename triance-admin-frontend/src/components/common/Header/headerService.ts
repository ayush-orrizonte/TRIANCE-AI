import { ApiResponse, get, post } from "../../../api";

const headerService = {
  getLoggedInUserInfo: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/loggedUserInfo");
  },

  logout: async (): Promise<ApiResponse<any>> => {
    return await post("/api/v1/auth/admins/logout", {});
  },

  getUnreadNotificationsCount: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/notifications/unreadCount");
  },
};

export default headerService;
