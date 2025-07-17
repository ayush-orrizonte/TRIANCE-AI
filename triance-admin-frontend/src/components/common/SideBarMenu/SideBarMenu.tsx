import React, { useState } from "react";
import { Box, Flex } from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks";

interface IMenu {
  route_url: string;
  menu_name: string;
  access: string;
  icon_class: string;
}

const SideBarMenu: React.FC = () => {
  const { setSideMenuOpen } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState<IMenu | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Static menu data
  const staticMenuItems: IMenu[] = [
    {
      route_url: "/user-management",
      menu_name: "User Management",
      access: "write",
      icon_class: "fas fa-users", // Using Font Awesome classes
    },
    {
      route_url: "/role-management",
      menu_name: "Role Management",
      access: "write",
      icon_class: "fas fa-user-shield", // Using Font Awesome classes
    },
  ];

  // Set initial selected menu
  React.useEffect(() => {
    if (!selectedMenu) {
      setSelectedMenu(staticMenuItems[0]);
      navigate(staticMenuItems[0].route_url);
    }
  }, []);

  return (
    <Box
      bg={"#fff"}
      className="w-full md:w-[20%] text-black h-screen fixed border-e border-gray-300 overflow-y-auto"
    >
      <Flex className="flex-col space-y-0.5">
        {staticMenuItems.map((menu, index) => (
          <Link
            key={`menu-${index}`}
            onClick={() => {
              setSideMenuOpen(false);
              setSelectedMenu(menu);
            }}
            to={menu.route_url}
            state={{ access: menu.access, menu_name: menu.menu_name }}
            className={`flex items-center p-2 text-gray-900 transition-colors duration-300 !mt-0
              hover:bg-gray-100 active:bg-gray-200 border-b border-gray-300 ${
                location.pathname.includes(menu.route_url)
                  ? "border-l-[6px] border-l-[#990007]"
                  : "border-l-[6px] border-l-[#ffffff]"
              }`}
          >
            <i className={menu.icon_class + " text-lg"}></i>
            <span
              className={`ml-2 text-sm ${
                location.pathname.includes(menu.route_url)
                  ? "text-[#990007] font-bold"
                  : ""
              }`}
            >
              {menu.menu_name}
            </span>
          </Link>
        ))}
      </Flex>
    </Box>
  );
};

export default SideBarMenu;