import express from "express";
import { passwordPoliciesController } from '../controllers';


const passwordPoliciesRouter = express.Router();

passwordPoliciesRouter.get("/list", passwordPoliciesController.listPasswordPolicies);

passwordPoliciesRouter.post("/add", passwordPoliciesController.addPasswordPolicy);

passwordPoliciesRouter.post("/update", passwordPoliciesController.updatePasswordPolicy);

passwordPoliciesRouter.get("/:passwordPolicyId", passwordPoliciesController.getPasswordPolicyById);

export default passwordPoliciesRouter;
