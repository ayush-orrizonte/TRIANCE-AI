import express from "express";
import { menusController } from "../controllers";

const menusRouter = express.Router();

menusRouter.post("/add", menusController.createMenu);

menusRouter.post("/update", menusController.updateMenu);

menusRouter.get("/list", menusController.getMenus);

menusRouter.get("/:menuId", menusController.getMenu);

menusRouter.post("/updateStatus", menusController.updateMenuStatus);

export default menusRouter;
