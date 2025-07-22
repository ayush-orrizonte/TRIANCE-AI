import Joi from "joi";
import { IPasswordPolicy } from "../../types/custom";

const passwordPoliciesValidations = {
  validateCreatePasswordPolicy: (
    PasswordPolicy: IPasswordPolicy
  ): Joi.ValidationResult => {
    const PasswordPolicySchema = Joi.object({
      minimumPasswordLength: Joi.number().required(),
      complexity: Joi.number().required(),
      alphabetical: Joi.boolean().required(),
      numeric: Joi.boolean().required(),
      specialCharacters: Joi.boolean().required(),
      allowedSpecialCharacters: Joi.string().required(),
      maximumInvalidAttempts: Joi.number().required(),
    });
    return PasswordPolicySchema.validate(PasswordPolicy);
  },
  validateUpdatePasswordPolicy: (
    PasswordPolicy: IPasswordPolicy
  ): Joi.ValidationResult => {
    const PasswordPolicySchema = Joi.object({
      minimumPasswordLength: Joi.number().optional(),
      complexity: Joi.number().required(),
      alphabetical: Joi.boolean().required(),
      numeric: Joi.boolean().required(),
      specialCharacters: Joi.boolean().optional(),
      allowedSpecialCharacters: Joi.string().optional(),
      maximumInvalidAttempts: Joi.number().optional(),
    });
    return PasswordPolicySchema.validate(PasswordPolicy);
  },
};

export default passwordPoliciesValidations;
