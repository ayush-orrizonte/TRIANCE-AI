import { MenuStatus } from "../enums/status";
import { IMenu } from "../types/custom";

class Menu implements IMenu {
    menu_id: number;
    menu_name: string;
    menu_description: string;
    status: number;
    menu_order: number;
    route_url: string;
    icon_class: string;
    date_created: string;
    date_updated: string;

    constructor(menu: IMenu) {
        this.menu_id = menu.menu_id;
        this.menu_name = menu.menu_name;
        this.menu_description = menu.menu_description;
        this.status = menu.status || MenuStatus.ACTIVE;
        this.menu_order = menu.menu_order;
        this.route_url = menu.route_url;
        this.icon_class = menu.icon_class;
        this.date_created = menu.date_created || new Date().toISOString();
        this.date_updated = menu.date_updated || new Date().toISOString();
    }
}

export { Menu };