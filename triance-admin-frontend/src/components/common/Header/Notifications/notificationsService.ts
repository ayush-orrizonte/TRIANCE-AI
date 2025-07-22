import { get } from "../../../../api";

const notificationsService = {
  listNotifications: async (pageSize?: number, currentPage?: number) => {
    const params = new URLSearchParams();

    if (pageSize) params.append("pageSize", pageSize.toString());
    if (currentPage) params.append("currentPage", currentPage.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await get(`/api/v1/admin/notifications/list${queryString}`);
  },
};

export default notificationsService;
