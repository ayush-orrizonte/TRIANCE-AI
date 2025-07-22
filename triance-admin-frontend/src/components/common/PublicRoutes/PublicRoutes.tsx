import React from "react";
import { PublicRoutesProps } from "./PublicRoutesProps";
import { useAuth } from "../../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const PublicRoutes: React.FC<PublicRoutesProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div>
      {!isAuthenticated ? (
        element
      ) : (
        <Navigate to="/user-management" state={{ from: location }} replace />
      )}
    </div>
  );
};

export default PublicRoutes;
