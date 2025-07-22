import  { Router } from "express";
import { adminController } from "../controllers";

const adminRouter = Router();

adminRouter.get("/health", adminController.health);
adminRouter.post("/create", adminController.createAdmin);
adminRouter.post("/update", adminController.updateAdmin);
adminRouter.get("/list/:roleId", adminController.listAdminsByRoleId);
adminRouter.post("/list", adminController.listAdmins);
adminRouter.get("/:adminId", adminController.getAdminById);
adminRouter.post("/resetPassword/:adminId", adminController.resetPasswordForAdminId);
adminRouter.post("/updateStatus", adminController.updateAdminStatus);
adminRouter.post("/updateLoginAttempts", adminController.updateLoginAttempts);
adminRouter.post("/updateLastLogin", adminController.updateLastLogin);


export default adminRouter;