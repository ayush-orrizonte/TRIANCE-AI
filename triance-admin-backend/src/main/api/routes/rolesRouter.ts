import express from "express";
import rolesController from "../controllers/rolesController";
const rolesRouter = express.Router();


rolesRouter.post("/list", rolesController.listRoles);

rolesRouter.post("/updateStatus", rolesController.updateRoleStatus);

rolesRouter.post("/add", rolesController.addRole);

rolesRouter.post("/update", rolesController.updateRole);

rolesRouter.get("/menusList", rolesController.getMenusList);

rolesRouter.get("/defaultAccessList", rolesController.getDefaultAccessList);

rolesRouter.get("/combinedAccess", rolesController.getCombinedAccess);

rolesRouter.get("/listLevels", rolesController.listLevels);

rolesRouter.get("/accessList/:roleId", rolesController.getAccessListByRoleId);

rolesRouter.get("/:roleId", rolesController.getRoleById);

export default rolesRouter;
