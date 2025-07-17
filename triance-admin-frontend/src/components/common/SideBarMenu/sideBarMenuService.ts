import { ApiResponse, get } from "../../../api";

const sideBarMenuService = {
    getCombinedAccess: async (): Promise<ApiResponse<any>> => {
        return await get('/api/v1/admin/roles/combinedAccess')
    }
};

export default sideBarMenuService;
