import React, { useRef, useState } from "react";
import UserList from "./UserList/UserList";
import { useLocation } from "react-router-dom";

const UserManagement: React.FC = () => {
 
  // For static version, default to WRITE access to show all functionality
  
  
  return (
    <div className="p-5">
        <UserList     />
    </div>
  );
};

export default UserManagement;