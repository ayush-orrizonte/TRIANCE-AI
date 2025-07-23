import Joi from "joi";
import { IAdmin } from "../../types/custom";
import { AdminStatus } from "../../enums/status";

const adminValidations = {
    validateCreateAdmin: (admin: IAdmin): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().optional(),
            admin_name: Joi.string().min(3).max(50).required(),
            admin_email: Joi.string().email().required(),
            profile_picture: Joi.string().uri().allow("", null).optional(),
            lastLogin_time: Joi.string().isoDate().allow("", null).optional(),
            invalidlogin_attempts: Joi.number().min(0).default(0).optional(),
            status: Joi.number().valid(...Object.values(AdminStatus).filter(value => typeof value === 'number')).default(AdminStatus.ACTIVE),
            role_id: Joi.number().required(),
            level: Joi.string().valid('super', 'admin', 'support').optional(),
        });
        return adminSchema.validate(admin);
    },

    validateUpdateAdmin: (admin: Partial<IAdmin>): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().required(),
            admin_name: Joi.string().min(3).max(50).optional(),
            admin_email: Joi.string().email().optional(),
            profile_picture: Joi.string().uri().allow("", null).optional(),
            role_id: Joi.number().optional(),
            level: Joi.string().optional(),
        });
        return adminSchema.validate(admin);
    },

    validateUpdateAdminStatus: (admin: Partial<IAdmin>): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().required(),
            status: Joi.number().valid(...Object.values(AdminStatus).filter(value => typeof value === 'number')).required(),
        });
        return adminSchema.validate(admin);
    },

    validateResetPassword: (admin: Partial<IAdmin>): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().required(),
            password: Joi.string().min(8).max(30).required()
        });
        return adminSchema.validate(admin);
    },

    validateLoginAttempts: (admin: Partial<IAdmin>): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().required(),
            invalidlogin_attempts: Joi.number().min(0).required()
        });
        return adminSchema.validate(admin);
    },

    validateLastLogin: (admin: Partial<IAdmin>): Joi.ValidationResult => {
        const adminSchema = Joi.object({
            admin_id: Joi.number().required(),
            lastLogin_time: Joi.string().isoDate().required()
        });
        return adminSchema.validate(admin);
    }
};

export default adminValidations;