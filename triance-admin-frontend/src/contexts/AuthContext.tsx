import React, { createContext, ReactNode, useState, useEffect } from "react";
import { appPreferences } from "../utils";
import { IMenu } from "../components/common/SideBarMenu/sideBarMenuTypes"; 
import { IUser } from "../pages/Admin/UserManagement/UserList/usersListTypes";

interface AuthContextProps {
  isAuthenticated: boolean;
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  userDetails: IUser;
  userToken: string;
  accessDetails: IMenu[];
  login: () => void;
  logout: () => void;
  setUserDetailsToContext: (userDetails: "") => void;
  setUserTokenToContext: (userToken: string) => void;
  setAccessDetailsToContext: (accessDetails: []) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userToken, setUserToken] = useState<any>(null);
  const [accessDetails, setAccessDetails] = useState<any>(null);

  const login = async () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUserDetails(null);
    setUserToken(null);
    setAccessDetails(null);
    await appPreferences.clearItems();
  };

  const setUserDetailsToContext = async (userDetails: any) => {
    setUserDetails(userDetails);
    await appPreferences.setItem("userDetails", JSON.stringify(userDetails));
  };

  const setUserTokenToContext = async (userToken: string) => {
    setUserToken(userToken);
    await appPreferences.setItem("userToken", userToken);
  };

  const setAccessDetailsToContext = async (accessDetails: any) => {
    setAccessDetails(accessDetails);
    await appPreferences.setItem(
      "accessDetails",
      JSON.stringify(accessDetails)
    );
  };

  useEffect(() => {
    (async () => {
      const storedToken = await appPreferences.getItem("userToken");
      const storedUserDetails = await appPreferences.getItem("userDetails");
    //  const storedAccessDetails = await appPreferences.getItem("accessDetails");

      setIsAuthenticated(() => {
        return storedToken ? true : false;
      });
      setUserToken(storedToken);
      setUserDetails(() => {
        return storedUserDetails ? JSON.parse(storedUserDetails) : null;
      });
    //   setAccessDetails(() => {
    //     return storedAccessDetails ? JSON.parse(storedAccessDetails) : null;
    //   });
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userDetails,
        userToken,
        accessDetails,
        login,
        logout,
        setUserDetailsToContext,
        setUserTokenToContext,
        setAccessDetailsToContext,
        sideMenuOpen,
        setSideMenuOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
