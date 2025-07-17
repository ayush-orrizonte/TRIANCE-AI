import React, { useState } from "react";
import { PrivateRoutesProps } from "./PrivateRoutesProps";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return (
    <div>
      {isAuthenticated ? (
        element
      ) : (
        <Navigate to="/" state={{ from: location }} replace />
      )}
    </div>
  );
};

export default PrivateRoutes;
