import { Router } from "express";
import { userController } from "../controllers";

const userRouter = Router();

userRouter.route("/login").post(userController.login);

userRouter.route("/logout").post(userController.logout);

userRouter
  .route("/requestResetPassword")
  .post(userController.requestResetPassword);

userRouter.route("/resetPassword").post(userController.resetPassword);

userRouter.route("/download-apk").get(userController.downloadApk);

export default userRouter;
