import { MenuAccess } from "../../../enums";

export interface SideBarMenuProps {}

export interface IMenu {
    menu_name: string;
    route_url: string;
    icon_class: string;
    access: MenuAccess;
}