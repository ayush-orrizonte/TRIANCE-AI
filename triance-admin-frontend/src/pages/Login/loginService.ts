import { ApiResponse, post } from "../../api";

export const loginService = {
  loginWithPassword: async (
    emailId: string,
    password: string
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/auth/admins/login", { emailId, password });
  },
};
