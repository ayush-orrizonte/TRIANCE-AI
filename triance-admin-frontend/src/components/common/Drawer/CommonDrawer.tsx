import React from "react";
import { Drawer } from "@mantine/core";
import { CommonDrawerProps } from "./commonDrawerTypes";
import { useLocation } from "react-router-dom";


const CommonDrawer: React.FC<CommonDrawerProps> = ({
  opened,
  onClose,
  title,
  children,
  position = "right",
  size = "md",  
  closeButtonProps,
}) => {
  const location = useLocation();
  const isFullWidth = location.pathname.includes("/admin/role-management") || location.pathname.includes("/admin/user-management");
  const drawerFlexGrow = isFullWidth ? 1 : 0;
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={position}
      size={size}
      title={title}
      closeButtonProps={closeButtonProps}
      styles={{
        content: {
          flexGrow: drawerFlexGrow,
        },
      }}
      withCloseButton={false}
    >
      {children}
    </Drawer>
  );
};

export default CommonDrawer;
