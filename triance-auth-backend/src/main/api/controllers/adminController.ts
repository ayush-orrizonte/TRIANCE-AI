import { Response } from "express";
import { Request } from "../../types/express";
import {
  EjsUtils,
  HttpStatusCodes,
  LoggerUtils,
  MailerUtils,
  RedisUtils,
} from "../../triance-commons";
import { ErrorCodes, RedisKeys } from "../../enums";
import { adminService } from "../services";
import { environment } from "../../config/environment";
import { encDecHelper, redisKeysFormatter } from "../../helpers";
import bcrypt from "bcryptjs";
import adminValidations from "../../validations/adminValidations";
import { AdminStatus } from "../../enums/status";
import path from "path";

const logger = LoggerUtils.getLogger("adminController");
const mailerUtils = MailerUtils.getInstance();
const redisUtils = RedisUtils.getInstance();

const adminController = {
  
  login: async (req: Request, res: Response): Promise<void> => {
    const loginRequest: { email: string; password: string } = req.body;
    console.log("------------------", req.body);
    const logPrefix = `login :: ${JSON.stringify(loginRequest)}`;
    
    try {
      logger.info(logPrefix);
      /*
                #swagger.tags = ['Admin']
                #swagger.summary = 'Admin Login'
                #swagger.description = 'Endpoint for Admin Login'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        email: 'admin@example.com',
                        password: 'yourPassword'
                    }
                }
      */
      // const { error } = await adminValidations.validateLoginDetails(req.body);
      // if (error) {
      //   const message = error.details?.[0]?.message || error.message;
      //   res.status(HttpStatusCodes.BAD_REQUEST).json({
      //     code: ErrorCodes.Admin.ADMIN000,
      //     message
      //   });
      //   return;
      // }

      const admin = await adminService.getAdminByEmail(loginRequest.email);
      
      if (!admin) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN001,
          message: "Invalid Admin",
        });
        return;
      }

      // loginRequest.password = encDecHelper.decryptPayload(loginRequest.password);



      const passwordPolicy = await adminService.getPasswordPolicy();
      const isPasswordValid = await bcrypt.compare(loginRequest.password, admin.password);

      if (!isPasswordValid) {
        if (admin.invalidlogin_attempts < passwordPolicy.maximumInvalidAttempts) {
          await adminService.updateInvalidLoginAttempts(admin.admin_email, admin.admin_id);
          res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.Admin.ADMIN001,
            message: "Invalid Credentials",
          });
          return;
        } else {
          // await adminService.updateAdminStatus(
          //   AdminStatus.INACTIVE,
          //   admin.admin_email
          // );
          const emailTemplateHtml = await EjsUtils.generateHtml(
            "src/main/views/generic_template.ejs",
            {
              name: admin.admin_name,
              body: "Your admin account has been deactivated due to multiple failed login attempts!",
              footer: "© 2025 Triance Ai. All Rights Reserved.",
            }
          );
          mailerUtils.sendEmail(
            "Admin Account Deactivated",
            emailTemplateHtml,
            admin.admin_email
          );
          res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.Admin.ADMIN003,
            message: "Account locked due to multiple failed attempts",
          });
          return;
        }
      }

      const payload = {
        id: admin.admin_id,
        name: admin.admin_name,
        email: admin.admin_email,
        role_id: Number(admin.role_id),
        level: admin.level !== undefined ? String(admin.level) : "",
        adminEmail: admin.admin_email,
      };

      const tokenDetails = await adminService.generateLoginToken(payload);
      await adminService.resetInvalidLoginAttempts(admin.admin_email, admin.admin_id);
      await adminService.updateAdminStatus(
        AdminStatus.LOGGED_IN,
        admin.admin_email,
        admin.invalidlogin_attempts > 0
      );

      res.status(HttpStatusCodes.OK).json({
        data: tokenDetails,
        message: "Admin login successful"
      });
      
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.Admin.ADMIN000)
      );
    }
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    try {
      /*  
            #swagger.tags = ['Admin']
            #swagger.summary = 'Logout Admin'
            #swagger.description = 'Endpoint to Logout Admin'
            #swagger.parameters['Authorization'] = {
                in: 'header',
                required: true,
                type: 'string',
                description: 'JWT token for authentication'
            }
        */
      const adminEmail = req.plainToken?.email;
      const adminId = req.plainToken?.id;

      if (adminEmail) {
        await adminService.updateAdminStatus(AdminStatus.LOGGED_OUT, adminEmail);
      }

      await adminService.clearCacheForAdmin(adminId, adminEmail);

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Admin logout successful"
      });
    } catch (error) {
      logger.error(`logout :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.Admin.ADMIN000)
      );
    }
  },

  requestResetPassword: async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
      logger.info(`requestResetPassword :: ${email}`);
      
      /*
                #swagger.tags = ['Admin']
                #swagger.summary = 'Request Reset Password'
                #swagger.description = 'Endpoint for Admin Reset Password Request'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        email: 'admin@example.com',
                    }
                }
      */
 
      // const { error } = await adminValidations.validateRequestPasswordDetails({ email });
      // if (error) {
      //   const message = error.details?.[0]?.message || error.message;
      //   res.status(HttpStatusCodes.BAD_REQUEST).json({
      //     code: ErrorCodes.Admin.ADMIN000,
      //     message
      //   });
      //   return;
      // }

      const admin = await adminService.getAdminByEmail(email);
      if (admin) {
        await adminService.getRequestResetPassword(admin);
      }

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Password reset instructions sent"
      });
    } catch (error) {
      logger.error(`requestResetPassword :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.Admin.ADMIN000)
      );
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const resetData = req.body;
    try {
      logger.info(`resetPassword :: txnId: ${resetData.txnId}`);
      
      /*
                #swagger.tags = ['Admin']
                #swagger.summary = 'Reset Admin Password'
                #swagger.description = 'Endpoint for Admin Password Reset'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        txnId: 'uuid',
                        newPassword: 'encryptedPasswordHash',
                        confirmPassword: 'encryptedPasswordHash'
                    }
                }
      */
      
      const { error } = await adminValidations.validateResetPassword(resetData);
      if (error) {
        const message = error.details?.[0]?.message || error.message;
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN000,
          message: "Internal server error",
        });
        return;
      }

      if (environment.decryptSensitiveData) {
        resetData.newPassword = encDecHelper.decryptPayload(resetData.newPassword);
        resetData.confirmPassword = encDecHelper.decryptPayload(resetData.confirmPassword);
      }

      if (resetData.newPassword !== resetData.confirmPassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN004,
          message: "Passwords do not match",
        });
        return;
      }

      if (!/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(resetData.newPassword)) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN005,
          message: "Password does not meet complexity requirements",
        });
        return;
      }

      const resetDetails = await adminService.getResetPasswordDetails(resetData.txnId);
      if (!resetDetails) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN006,
          message: "Invalid reset password request",
        });
        return;
      }

      const { adminEmail } = JSON.parse(resetDetails);
      const admin = await adminService.getAdminByEmail(adminEmail);
      if (!admin) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN009,
          message: "Invalid request",
        });
        return;
      }

      const isSamePassword = await bcrypt.compare(resetData.newPassword, admin.password);
      if (isSamePassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN001,
          message: "New password cannot be same as old password",
        });
        return;
      }

      const newPasswordHash = await bcrypt.hash(resetData.newPassword, 10);
      const success = await adminService.updatePassword(
        admin.admin_email,
        admin.admin_id,
        resetData.txnId,
        newPasswordHash
      );

      if (!success) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.Admin.ADMIN008,
          message: "Invalid password reset",
        });
        return;
      }

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Admin password updated successfully"
      });
    } catch (error) {
      logger.error(`resetPassword :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.Admin.ADMIN000)
      );
    }
  }
};

export default adminController;
