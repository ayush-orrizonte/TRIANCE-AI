import { ApiResponse, get, post } from "../../../api";


const passwordPolicyService = {
    getPasswordPolicyList: async (): Promise<ApiResponse<any>> => {
        return await get("/api/v1/passwordPolicies/list")
    },

    addPasswordPolicy: async (data: any): Promise<ApiResponse<any>> => {
        return await post('/api/v1/passwordPolicies/add', data);
    },

    updatePasswordPolicy: async (data: { id: string; [key: string]: any }): Promise<ApiResponse<any>> => {
        return await post('/api/v1/passwordPolicies/update', data);
    }
};

export default passwordPolicyService;
