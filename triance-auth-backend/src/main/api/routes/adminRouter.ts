import { Router } from "express";
import { adminController } from "../controllers";

const adminRouter = Router();

// adminRouter.route("/validateToken").get(adminController.validateToken);

adminRouter.route("/login").post(adminController.login);

adminRouter.route("/logout").post(adminController.logout);

adminRouter.route("/requestResetPassword").post(adminController.requestResetPassword);

adminRouter.route("/resetPassword").post(adminController.resetPassword);

// adminRouter.route("/getForgetPasswordOtp").post(adminController.getForgetPasswordOtp);

// adminRouter.route("/verifyForgetPasswordOtp").post(adminController.verifyForgetPasswordOtp);




export default adminRouter;
