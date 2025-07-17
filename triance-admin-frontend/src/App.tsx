import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import RoleManagement from "./pages/Admin/RoleManagement/RoleManagement";
import SideBarMenu from "./components/common/SideBarMenu/SideBarMenu";

function App() {
  const location = useLocation();

  useEffect(() => {
    console.log("Route changed to:", location.pathname);
  }, [location]);

  return (
    <div className="flex flex-col md:flex-row w-full">
    
      <aside className="w-full md:w-[20%] hidden md:block">
        <SideBarMenu />
      </aside>
      
    
      <main className="w-full md:w-[80%] p-4">
        <Routes>
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/role-management" element={<RoleManagement />} />
          
        
          <Route 
            path="/" 
            element={<UserManagement />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;