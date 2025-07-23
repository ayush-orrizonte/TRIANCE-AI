import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { Suspense, lazy } from "react";
//import UserManagement from "./pages/Admin/UserManagement/UserManagement";
//import RoleManagement from "./pages/Admin/RoleManagement/RoleManagement";

const RoleManagement = lazy(
  () => import("./pages/Admin/RoleManagement/RoleManagement")
);

const UserManagement = lazy(
  () => import("./pages/Admin/UserManagement/UserManagement")
);
const PasswordPolicy = lazy(
  () => import("./pages/Admin/PasswordPolicy/PasswordPolicy")
);

import SideBarMenu from "./components/common/SideBarMenu/SideBarMenu";
import PublicRoutes from "./components/common/PublicRoutes/PublicRoutes";
import Login from "./pages/Login/Login";
import OtpLogin from "./pages/Login/OtpLogin/OtpLogin";
import ForgetPassword from "./pages/Login/ForgetPassword/ForgetPassword";
import ResetPassword from "./pages/Login/ResetPassword/ResetPassword";
import LoadingFallback from "./components/common/LoadingFallback/LoadingFallback";
//import PrivateRoutes from "./components/common/PrivateRoutes/PrivateRoutes";
import { useAuth, useLoader, useLogger, useToast } from "./hooks";
import { setupInterceptors } from "./api/axiosConfig";
import { LogLevel } from "./enums";
import Header from "./components/common/Header/Header";
import PrivateRoutes from "./components/common/PrivateRoutes/PrivateRoutes";

function App() {
  const { userToken, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();
  const { setLogLevel, log } = useLogger();

  setupInterceptors(userToken, logout, showLoader, hideLoader, showToast, log);
  setLogLevel(LogLevel.INFO);

  useEffect(() => {
    console.log("Route changed to:", location.pathname);
  }, [location]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Header/>
  
      <div className="flex flex-col md:flex-row w-full">
         {isAuthenticated && (
          <aside className="w-full mt-20 md:w-[20%] hidden md:block ">
            <SideBarMenu />
          </aside>
        )}
        <main
          className={`w-full  md:w-[80%] ap-4 ${
            isAuthenticated
              ? "md:w-[80%] sm:w-[100%] xs:w-[100%] pt-20 sm:pt-16 md:pt-20"
              : ""
          } ${!location.state ? "" : ""}`}

          // className={`w-full h-screen relative md:w-[80%] sm:w-[100%] xs:w-[100%] pt-20 sm:pt-16 md:pt-20  ${
          //   !location.state ? "px-2 lg:px-4" : ""
          // }`}
        >
          <Routes>
            <Route
              path="/"
              element={<PublicRoutes element={<Navigate to="/login" />} />}
            />
            <Route
              path="/login"
              element={<PublicRoutes element={<Login />} />}
            />

            <Route
              path="/otp-login"
              element={<PublicRoutes element={<OtpLogin />} />}
            />
            <Route
              path="/forget-password"
              element={<PublicRoutes element={<ForgetPassword />} />}
            />
            <Route
              path="/reset-password"
              element={<PublicRoutes element={<ResetPassword />} />}
            />
            <Route
              path="/role-management"
              element={<PrivateRoutes element={<RoleManagement />} />}
            />
            <Route
              path="/user-management"
              element={<PrivateRoutes element={<UserManagement />} />}
            />
            <Route
              path="/password-policy"
              element={<PrivateRoutes element={<PasswordPolicy />} />}
            />
          </Routes>
        </main>
      </div>
    </Suspense>
  );
}

export default App;
