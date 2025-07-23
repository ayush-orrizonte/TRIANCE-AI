import React, { useRef, useState } from "react";
import UserList from "./UserList/UserList";
import { useLocation } from "react-router-dom";
import { MenuAccess } from "../../../enums";

const UserManagement: React.FC = () => {
  const location = useLocation();
  const access = location.state ? location.state.access : MenuAccess.READ;
  const userListRef = useRef<{ refresh: () => void } | null>(null);
  
  const [userId, setUserId] = useState<number | null>(null);

  const handleUpdateUser = (user_id: number) => {
    setUserId(user_id);
  };
  
  return (
    <div className="p-5">
        <UserList access={access} ref={userListRef} handleUpdateUser={handleUpdateUser} />
    </div>
  );
};

export default UserManagement;
