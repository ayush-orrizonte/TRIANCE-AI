import { ApiResponse, post } from "../../../api";

const forgotPasswordService = {
    sendOtp: async (emailId: string): Promise<ApiResponse<any>> => {
        const payload = {
          emailId: emailId,
        };
        return await post("/api/v1/auth/admins/getForgetPasswordOtp", payload);
      },
    
      verifyOtp: async (
        otp: string,
        txnId: string
      ): Promise<ApiResponse<any>> => {
        const payload = {
          otp,
          txnId,
        
        };
        return await post("/api/v1/auth/admins/verifyForgetPasswordOtp", payload);
      },
};

export default forgotPasswordService;
