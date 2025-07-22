import { Router } from "express";
import { authController } from "../controllers";

const authRouter = Router();

authRouter.route("/health").get(authController.healthCheck);

export default authRouter;
