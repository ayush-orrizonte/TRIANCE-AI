import { Application } from "express";
import adminRouter from "../api/routes/adminRouter";
import menusRouter from "../api/routes/menusRouter";
import passwordPoliciesRouter from "../api/routes/passwordPoliciesRouter";
import usersRouter from "../api/routes/usersRouter";
import rolesRouter from "../api/routes/rolesRouter";

export default (app: Application) => {
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/menus", menusRouter);
  app.use("/api/v1/admin/passwordPolicies", passwordPoliciesRouter);
  app.use("/api/v1/users",usersRouter);
  app.use("/api/v1/admin/roles",rolesRouter)
  };