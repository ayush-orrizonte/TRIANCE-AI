import React, { useRef, useState } from "react";
import RoleList from "./RoleList/RoleList";
import { useLocation } from "react-router-dom";
import { MenuAccess } from "../../../enums";

const RoleManagement: React.FC = () => {
  const location = useLocation();
  const access = location.state ? location.state.access : MenuAccess.READ;
  const menuName = location.state ? location.state.menu_name : "Role Management";
  const [roleId, setRoleId] = useState<number | null>(null);
  const rolesListRef = useRef<{ refresh: () => void } | null>(null);


  const handleUpdateRole = (roleId: number) => {
    setRoleId(roleId);
  };
  return (
    <div className="p-5">
      <RoleList access={access} ref={rolesListRef} handleUpdateRole={handleUpdateRole} />
    </div>
  );
};

export default RoleManagement;
