import Joi from "joi";
import { IRole } from "../../types/custom";
import { ErrorCodes } from "../../enums";
import { Levels, RoleStatus } from "../../enums/status";

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
            menu_id: Joi.number().optional(),
            permission_id: Joi.number().optional(),
          })
        )
        .optional(),
      status: Joi.number()
        .valid(...Object.values(RoleStatus).filter((val) => typeof val === "number"))
        .optional(),
      level: Joi.string().optional(),
      date_created: Joi.string().allow("", null).optional(),
      date_updated: Joi.string().allow("", null).optional(),
      created_by: Joi.number().optional(),
      updated_by: Joi.number().optional(),
    });

    return roleSchema.validate(role);
  },

  validateUpdateRole: (role: IRole): Joi.ValidationResult => {
    const roleSchema = Joi.object({
      role_id: Joi.number().required(),
      role_name: Joi.string()
        .min(3)
        .max(30)
        .optional(),
      role_description: Joi.string()
        .min(3)
        .max(50)
        .optional(),
      permissions: Joi.array()
        .items(
          Joi.object({
            menu_id: Joi.number().optional(),
            permission_id: Joi.number().optional(),
          })
        )
        .optional()
        .error(new Error(ErrorCodes.roles.ROLE00010.errorMessage)),
      status: Joi.number()
        .valid(...Object.values(RoleStatus).filter((val) => typeof val === "number"))
        .optional(),
      level: Joi.string().optional(),
    });

    return roleSchema.validate(role);
  },
};

export default rolesValidations;
