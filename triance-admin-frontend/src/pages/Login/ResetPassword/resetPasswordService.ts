import { ApiResponse, post } from "../../../api";

const resetPasswordService = {
  resetPassword: async (
    txnId: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<any>> => {
    const payload = {
      txnId: txnId,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };
    return await post("/api/v1/auth/admins/resetPassword", payload);
  },
};

export default resetPasswordService;

