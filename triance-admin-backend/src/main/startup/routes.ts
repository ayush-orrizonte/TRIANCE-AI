import { Application } from "express";
import adminRouter from "../api/routes/adminRouter";
import menusRouter from "../api/routes/menusRouter";
import passwordPoliciesRouter from "../api/routes/passwordPoliciesRouter";

export default (app: Application) => {
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/menus", menusRouter);
  app.use("/api/v1/passwordPolicies", passwordPoliciesRouter);
  };