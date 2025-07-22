import { ApiResponse, post } from "../../api";

export const loginService = {
  loginWithPassword: async (
    email: string,
    password: string
  ): Promise<ApiResponse<any>> => {
    return await post("/api/v1/auth/admins/login", { email, password });
  },
};
