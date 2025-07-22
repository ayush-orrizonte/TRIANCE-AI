import { ApiResponse, post } from "../../../api";


export const LoginOtpService = {
  sendOtp: async (mobileNumber: string): Promise<ApiResponse<any>> => {
    return await post("/api/v1/auth/admin/getLoginOtp", { mobileNumber });
  },
  verifyOtp: async (otp: string, txnId: string): Promise<ApiResponse<any>> => {
    return await post("/api/v1/auth/admin/verifyLoginOtp", { otp, txnId });
  },
};
