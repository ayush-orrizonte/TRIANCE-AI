import Joi from "joi";


const adminValidations = {
    validateLoginDetails: (loginDetails: {
        emailId: string;
        password: string;
      }): Joi.ValidationResult => {
        const loginSchema = Joi.object({
          emailId: Joi.string().email().required(),
          password: Joi.string()
            .min(8)
            .pattern(/[A-Z]/, "uppercase")
            .pattern(/[a-z]/, "lowercase")
            .pattern(/[0-9]/, "number")
            .pattern(/[\W_]/, "special character")
            .required()
            .messages({
              "string.min": "Password must be at least 8 characters long.",
              "string.pattern.name": "Password must include at least one {#name}.",
              "any.required": "Password is required.",
            }),
        });
        return loginSchema.validate(loginDetails);
      },
      validatRequestPasswordDetails: (resetRequestDetails: {
          emailId: string;
        }): Joi.ValidationResult => {
          const requestPasswordSchema = Joi.object({
            emailId: Joi.string().email().required(),
          });
          return requestPasswordSchema.validate(resetRequestDetails);
        },
        validateResetPassword: (resetPasswordDetails: { newPassword: string, confirmPassword: string, txnId: string }): Joi.ValidationResult => {
            const resetPasswordSchema = Joi.object({
                txnId: Joi.string().required(),
                newPassword: Joi.string().required(),
                confirmPassword: Joi.string().required()
            });
            return resetPasswordSchema.validate(resetPasswordDetails);
        },
        validateVerifyForgotPassword: (otpDetails: { otp: string, txnId: string }): Joi.ValidationResult => {
          const verifyForgotPasswordSchema = Joi.object({
              otp: Joi.string().required(),
              txnId: Joi.string().required()
          });
          return verifyForgotPasswordSchema.validate(otpDetails);
      },
}
export default adminValidations