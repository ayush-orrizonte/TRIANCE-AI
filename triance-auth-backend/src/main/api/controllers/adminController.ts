import { Response } from "express";
import { Request } from "../../types/express";
import jwt from "jsonwebtoken";
import { authConfig, environment } from "../../config";
import {
  HttpStatusCodes,
  LoggerUtils,
  RedisUtils,
  MailerUtils,
  EjsUtils,
} from "gm-commons";
import { UserStatus } from "../../enums/status";
import { adminService } from "../services";
import { v4 as uuidv4 } from "uuid";
import { encDecHelper, redisKeysFormatter } from "../../helpers";
import { IAdmin } from "../../types/custom";
import bcrypt from "bcryptjs";
import { adminRepository } from "../repositories";
import { adminValidations } from "../../validations";
import { RedisKeys, ErrorCodes } from "../../enums";

const logger = LoggerUtils.getLogger("adminController");
const mailerUtils = MailerUtils.getInstance();
const redisUtils = RedisUtils.getInstance();

const adminController = {
  validateToken: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `adminController :: validateToken`;
    const token = req.header("authorization");

    try {
      logger.info(`${logPrefix} :: Request received`);

      /*
        #swagger.tags = ['Admin']
        #swagger.summary = 'Validate Token'
        #swagger.description = 'Endpoint to validate Admin JWT Token'
      */

      if (!token) {
        logger.warn(`${logPrefix} :: No token provided`);
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN010));
        return;
      }

      const decodedToken = jwt.verify(token, environment.secretKey);

      res.status(HttpStatusCodes.OK).send({
        data: decodedToken,
        message: "Token validated successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.parse(ErrorCodes.Admin.ADMIN000));
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const loginRequest: { emailId: string; password: string } = req.body;
    const logPrefix = `adminLogin :: loginRequest :: ${JSON.stringify(
      loginRequest
    )}`;

    try {
      logger.info(`${logPrefix} :: Request received`);
      /*  
                #swagger.tags = ['Admin']
                #swagger.summary = 'Admin Login'
                #swagger.description = 'Endpoint for Admin Login'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        emailId: 'admin@gmail.com',
                        password: 'yourPassword'
                    }
                }  
            */

      const { error } = await adminValidations.validateLoginDetails(req.body);
      if (error) {
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: ErrorCodes.Admin.ADMIN000,
          message: error.details?.[0].message || error.message,
        });
        return;
      }

      const admin = await adminService.getAdminByEmail(loginRequest.emailId);
      if (!admin) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN001));
        return;
      }

      if (environment.decryptSensitiveData) {
        loginRequest.password = encDecHelper.decryptPayload(
          loginRequest.password
        );
      }

      const passwordPolicy = await adminService.getPasswordPolicy();

      const isPasswordValid = await bcrypt.compare(
        loginRequest.password,
        admin.password
      );

      if (isPasswordValid) {
        const payload = {
          id: admin.userId,
          name: admin.userName,
          email: admin.emailId,
          roleId: admin.roleId,
          level: admin.level,
        };

        const tokenDetails = await adminService.generateLoginToken(payload);

        await adminService.updateAdminStatus(
          UserStatus.LOGGED_IN,
          admin.emailId,
          admin.invalidAttempts !== 0 &&
            admin.invalidAttempts < passwordPolicy.maximumInvalidAttempts
        );

        res.status(HttpStatusCodes.OK).send({
          data: tokenDetails,
          message: "Logged in Successfully",
        });
      } else {
        if (admin.invalidAttempts < passwordPolicy.maximumInvalidAttempts) {
          await adminService.updateInvalidLoginAttempts(
            admin.emailId,
            admin.userId
          );
          res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send(JSON.parse(ErrorCodes.Admin.ADMIN001));
        } else {
          await adminService.updateAdminStatus(
            UserStatus.INACTIVE,
            admin.emailId
          );

          const emailTemplateHtml = await EjsUtils.generateHtml(
            "src/main/views/generic_template.ejs",
            {
              name: admin.userName,
              body: "Your admin account has been deactivated!",
              footer: "© 2025 GuruMitra. All Rights Reserved.",
            }
          );

          mailerUtils.sendEmail(
            "Guru Mitra | Admin Account Deactivated",
            emailTemplateHtml,
            admin.emailId
          );

          res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send(JSON.parse(ErrorCodes.Admin.ADMIN003));
        }
      }
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.parse(ErrorCodes.Admin.ADMIN000));
    }
  },
  logout: async (req: Request, res: Response): Promise<void> => {
    /*  
            #swagger.tags = ['Admin']
            #swagger.summary = 'Admin Logout'
            #swagger.description = 'Endpoint for Admin Logout'
            #swagger.parameters['Authorization'] = {
                in: 'header',
                required: true,
                type: 'string',
                description: 'JWT token for authentication'
            }
        */

    const logPrefix = `adminController :: logout`;

    try {
      const adminEmail = req.plainToken?.email;
      const adminId = req.plainToken?.id;

      if (adminEmail) {
        await adminService.updateAdminStatus(UserStatus.LOGGED_OUT, adminEmail);
      }

      await adminService.clearCacheForAdmin(adminId, adminEmail);

      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Logged out Successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.parse(ErrorCodes.Admin.ADMIN000));
    }
  },
  requestResetPassword: async (req: Request, res: Response): Promise<void> => {
    const resetRequestDetails: { emailId: string } = req.body;
    const logPrefix = `adminController :: requestResetPassword :: resetRequestDetails :: ${JSON.stringify(
      resetRequestDetails
    )}`;

    try {
      logger.info(logPrefix);

      /*
            #swagger.tags = ['Admin']
            #swagger.summary = 'Admin Request Reset Password'
            #swagger.description = 'Endpoint for Admin to request password reset'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    emailId: 'admin@example.com',
                }
            }
          */

      const { error } = await adminValidations.validatRequestPasswordDetails(
        resetRequestDetails
      );
      if (error) {
        const errMsg = error.details ? error.details[0].message : error.message;

        logger.warn(`${logPrefix} :: bad request :: ${errMsg}`);

        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN000",
          message: errMsg,
        });
        return;
      }

      const admin = await adminService.getAdminByEmail(
        resetRequestDetails.emailId
      );
      if (!admin) {
        logger.warn(`${logPrefix} :: Admin not found`);
        res.status(HttpStatusCodes.NOT_FOUND).send({
          code: "ADMIN001",
          message: "Admin not found with the provided email",
        });
        return;
      }

      await adminService.getRequestResetPassword(admin);

      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Password reset requested successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.parse(ErrorCodes.Admin.ADMIN000));
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const resetPasswordRequest: {
      txnId: string;
      newPassword: string;
      confirmPassword: string;
    } = req.body;

    const logPrefix = `adminController :: resetPassword :: resetPasswordRequest :: ${JSON.stringify(
      resetPasswordRequest
    )}`;

    try {
      /*
            #swagger.tags = ['Admin']
            #swagger.summary = 'Reset Password'
            #swagger.description = 'Endpoint for Admin to reset password using a transaction ID'
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

      const { error } = await adminValidations.validateResetPassword(
        resetPasswordRequest
      );
      if (error) {
        const errMsg = error.details ? error.details[0].message : error.message;
        logger.warn(`${logPrefix} :: bad request :: ${errMsg}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN000",
          message: errMsg,
        });
        return;
      }

      if (environment.decryptSensitiveData) {
        resetPasswordRequest.newPassword = encDecHelper.decryptPayload(
          resetPasswordRequest.newPassword
        );
        resetPasswordRequest.confirmPassword = encDecHelper.decryptPayload(
          resetPasswordRequest.confirmPassword
        );
      }

      if (
        resetPasswordRequest.newPassword !==
        resetPasswordRequest.confirmPassword
      ) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN004));
        return;
      }

      

      const requestPasswordDetails = await adminService.getResetPasswordDetails(
        resetPasswordRequest.txnId
      );
      if (!requestPasswordDetails) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN006));
        return;
      }

      const parsedRequestPasswordDetails = JSON.parse(requestPasswordDetails);

      const admin = await adminService.getAdminByEmail(
        parsedRequestPasswordDetails.adminEmail
      );
      if (!admin) {
        logger.warn(`${logPrefix} :: invalid request :: admin not found`);
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN009));
        return;
      }

      const isPasswordNotChanged = await bcrypt.compare(
        resetPasswordRequest.newPassword,
        admin.password
      );
      if (isPasswordNotChanged) {
        logger.warn(
          `${logPrefix} :: isPasswordNotChanged :: ${isPasswordNotChanged}`
        );
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN007));
        return;
      }

      const passwordHash = await bcrypt.hash(
        resetPasswordRequest.newPassword,
        10
      );
      const passwordResetted = await adminService.updatePassword(
        admin.emailId,
        admin.userId,
        resetPasswordRequest.txnId,
        passwordHash
      );

      if (!passwordResetted) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(JSON.parse(ErrorCodes.Admin.ADMIN008));
        return;
      }

      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Password reset successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.parse(ErrorCodes.Admin.ADMIN000));
    }
  },
  getForgetPasswordOtp: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `adminController :: getForgetPasswordOtp `;
   
  
    try {
      logger.info(`${logPrefix} :: Request received`);
  
      /*
        #swagger.tags = ['Admin']
        #swagger.summary = 'Get Forgot Password OTP'
        #swagger.description = 'Endpoint to generate OTP for admin forgot password using email'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            emailId: "admin@example.com"
          }
        }
      */
        const { emailId } = req.body;

      if (!emailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
        logger.warn(`${logPrefix} :: Invalid email format`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.Admin.ADMIN011);
        return;
      }
  
      const adminExists = await adminRepository.existsByEmail(emailId);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found`);
        res.status(HttpStatusCodes.NOT_FOUND).send(ErrorCodes.Admin.ADMIN012);
        return;
      }
  
      
      const txnId = await adminService.getForgetPasswordOtp(emailId);
  
      res.status(HttpStatusCodes.OK).send({
        data: { txnId },
        message: "Generated Forget Password OTP successfully",
      });
  
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.Admin.ADMIN000);
    }
  },
  verifyForgetPasswordOtp: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `adminController :: verifyForgetPasswordOtp`;
    
    try {
      logger.info(`${logPrefix} :: Request received`);
  
      /*
        #swagger.tags = ['Admin']
        #swagger.summary = 'Verify Forgot Password OTP'
        #swagger.description = 'Endpoint to verify OTP for admin forgot password using txnId and OTP'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            otp: 'encryptedOtp',
            txnId: 'uuid'
          }
        }
      */
  
      const otpDetails = req.body;
      const { error } = await adminValidations.validateVerifyForgotPassword(otpDetails);
  
      if (error) {
        logger.warn(`${logPrefix} :: Validation failed :: ${error.details?.[0]?.message || error.message}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.Admin.ADMIN000,
          errorMessage: error.details?.[0]?.message || error.message,
        });
        return;
      }
  
      if (environment.decryptSensitiveData) {
        otpDetails.otp = encDecHelper.decryptPayload(otpDetails.otp);
      }
  
      const txnId = otpDetails.txnId;
      const otp = otpDetails.otp
      const cachedOtpData = await adminService.getForgotPasswordOtpDetails(txnId);
  
      if (!cachedOtpData) {
        logger.warn(`${logPrefix} :: OTP details not found in Redis for txnId: ${txnId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.Admin.ADMIN013);
        return;
      }
  
      const otpPayload = JSON.parse(cachedOtpData);
  
      if (
        otpPayload.otp !== parseInt(otp) ||
        otpPayload.txnId !== txnId
      ){
        logger.warn(`${logPrefix} :: OTP mismatch or invalid txnId`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.Admin.ADMIN013);
        return;
      }
  
      const newTxnId = await adminService.verifyForgetPasswordOtp(otpPayload.userName, txnId)
  
      res.status(HttpStatusCodes.OK).send({
        data: { txnId: newTxnId },
        message: "Verified Forget Password OTP successfully",
      });
  
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.Admin.ADMIN000);
    }
  },
  
  
};

export default adminController;
