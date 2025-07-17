import  { Router } from "express";
import { adminController } from "../controllers";

const adminRouter = Router();

adminRouter.get("/health", adminController.health);

export default adminRouter;