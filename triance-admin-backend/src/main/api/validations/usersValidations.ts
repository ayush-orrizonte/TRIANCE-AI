import Joi from "joi";
import { IUser } from "../../types/custom";
import { UserStatus } from "../../enums/status";
import { ErrorCodes } from "../../enums";

const userValidation = {
  validateCreateUser: (user: IUser): Joi.ValidationResult => {
    const userSchema = Joi.object({
      user_id: Joi.string().optional(),

      user_name: Joi.string()
        .min(3)
        .max(50)
        .error(new Error(ErrorCodes.users.USER00001.errorMessage))
        .allow("", null)
        .optional(),

      display_name: Joi.string()
        .min(3)
        .max(50)
        .error(new Error(ErrorCodes.users.USER00002.errorMessage))
        .allow("", null)
        .optional(),

      first_name: Joi.string()
        .min(3)
        .max(20)
        .optional()
        .error(new Error(ErrorCodes.users.USER00003.errorMessage)),

      last_name: Joi.string()
        .min(3)
        .max(20)
        .optional()
        .error(new Error(ErrorCodes.users.USER00004.errorMessage)),

      mobile_number: Joi.number()
        .integer()
        .min(6000000000)
        .max(9999999999)
        .allow(null, "")
        .optional(),

      dob: Joi.date().iso().allow("", null).optional(),

      email_id: Joi.string().email().min(3).max(50).optional(),


      role_id: Joi.string().optional(),

      password: Joi.string().min(3).max(200).optional(),

      invalid_attempts: Joi.number(),

      status: Joi.number(),

      last_logged_in: Joi.string().allow("", null).optional(),

      date_created: Joi.string().allow("", null).optional(),

      date_updated: Joi.string().allow("", null).optional(),

      created_by: Joi.string().allow("", null).optional(),

      updated_by: Joi.string().allow("", null).optional(),
    });

    return userSchema.validate(user);
  },

  validateUpdateUser: (user: IUser): Joi.ValidationResult => {
    const userSchema = Joi.object({
      user_id: Joi.string().optional(),

      user_name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .error(new Error(ErrorCodes.users.USER00001.errorMessage)),

      display_name: Joi.string().min(3).max(50).optional(),

      first_name: Joi.string().min(3).max(20).allow(null, "").optional(),

      last_name: Joi.string().min(3).max(20).allow(null, "").optional(),

      dob: Joi.date().iso().allow("", null).optional(),

      mobile_number: Joi.number()
        .integer()
        .min(6000000000)
        .max(9999999999)
        .allow(null, "")
        .optional(),

      email_id: Joi.string().email().min(3).max(50).allow(null, "").optional(),


      role_id: Joi.string().required(),

      status: Joi.number().valid(
        ...Object.values(UserStatus).filter(
          (value) => typeof value === "number"
        )
      ),
    });

    return userSchema.validate(user);
  },
};

export default userValidation;
