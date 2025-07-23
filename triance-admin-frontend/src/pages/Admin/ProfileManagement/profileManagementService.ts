import { ApiResponse, post, get } from "../../../api";

export const profileService = {
  updateProfile: async (values: any): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/updateProfile", values);
  },

  getLoggedInUserInfo: async (): Promise<ApiResponse<any>> => {
    return await get("/api/v1/admin/loggedUserInfo");
  },
  updateProfilePic: async (formData: FormData): Promise<ApiResponse<any>> => {
    return await post("/api/v1/admin/updateProfilePic", formData);
  },
};
