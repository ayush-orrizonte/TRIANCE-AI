import Joi from "joi";
import { IRole } from "../../types/custom";
import { ErrorCodes } from "../../enums";
import { RoleStatus } from "../../enums/status";

const rolesValidations = {
  validateCreateRole: (role: IRole): Joi.ValidationResult => {
    const roleSchema = Joi.object({
      role_id: Joi.string().optional(),
      role_name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .error(new Error(ErrorCodes.roles.ROLE00001.errorMessage)),
      role_description: Joi.string()
        .min(3)
        .max(50)
        .required()
        .error(new Error(ErrorCodes.roles.ROLE00002.errorMessage)),
      permissions: Joi.array()
        .items(
          Joi.object({
            menu_id: Joi.string().optional(),
            permission_id: Joi.number().optional(),
          })
        )
        .optional()
        .error(new Error(ErrorCodes.roles.ROLE00010.errorMessage)),
      status: Joi.number()
        .valid(...Object.values(RoleStatus).filter((val) => typeof val === "number"))
        .optional(),
      date_created: Joi.string().allow("", null).optional(),
      date_updated: Joi.string().allow("", null).optional(),
      created_by: Joi.string().optional(),
      updated_by: Joi.string().optional(),
    });

    return roleSchema.validate(role);
  },

  validateUpdateRole: (role: IRole): Joi.ValidationResult => {
    const roleSchema = Joi.object({
      role_id: Joi.string().required(),
      role_name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .error(new Error(ErrorCodes.roles.ROLE00001.errorMessage)),
      role_description: Joi.string()
        .min(3)
        .max(50)
        .required()
        .error(new Error(ErrorCodes.roles.ROLE00002.errorMessage)),
      permissions: Joi.array()
        .items(
          Joi.object({
            menu_id: Joi.string().optional(),
            permission_id: Joi.number().optional(),
          })
        )
        .optional()
        .error(new Error(ErrorCodes.roles.ROLE00010.errorMessage)),
      status: Joi.number()
        .valid(...Object.values(RoleStatus).filter((val) => typeof val === "number"))
        .optional(),
    });

    return roleSchema.validate(role);
  },
};

export default rolesValidations;
