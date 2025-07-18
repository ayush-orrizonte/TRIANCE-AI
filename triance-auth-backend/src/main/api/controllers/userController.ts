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
import { userService } from "../services";
import { environment } from "../../config/environment";
import { encDecHelper, redisKeysFormatter } from "../../helpers";
import bcrypt from "bcryptjs";
import userValidations from "../../validations/userValidations";
import { UserStatus } from "../../enums/status";
import path from "path";

const logger = LoggerUtils.getLogger("userController");
const mailerUtils = MailerUtils.getInstance();
const redisUtils = RedisUtils.getInstance();

const userController = {
  
  login: async (req: Request, res: Response): Promise<void> => {
    const loginRequest: { emailId: string; password: string } = req.body;
    const logPrefix = `login :: ${JSON.stringify(loginRequest)}`;
    
    try {
     logger.info(logPrefix);
      /*
                #swagger.tags = ['Users']
                #swagger.summary = 'User Login'
                #swagger.description = 'Endpoint for User Login'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        emailId: 'User@example.com',
                        password: 'yourPassword'
                    }
                }
      */
      const { error } = await userValidations.validateLoginDetails(req.body);
      if (error) {
        const message = error.details?.[0]?.message || error.message;
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER000,
          message
          });
          return;

      }


      const user = await userService.getUserByEmail(loginRequest.emailId);
      if (!user) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER001,
          message: " Invalid User",
          });
          return;

      }

      
      if (environment.decryptSensitiveData) {
        loginRequest.password = encDecHelper.decryptPayload(loginRequest.password);
      }

      
      const passwordPolicy = await userService.getPasswordPolicy();
      const isPasswordValid = await bcrypt.compare(
        loginRequest.password,
        user.password
      );

      if (!isPasswordValid) {
        
        if (user.invalidLoginAttempts < passwordPolicy.maximumInvalidAttempts) {
          await userService.updateInvalidLoginAttempts(user.email, user.userId);
          res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER001,
          message: " Invalid User",
          });
          return;
        } else {
          
          await userService.updateUserStatus(
            UserStatus.INACTIVE,
            user.email
          );
          const emailTemplateHtml = await EjsUtils.generateHtml(
            "src/main/views/generic_template.ejs",
            {
              name: user.username,
              body: "Your account has been deactivated due to multiple failed login attempts!",
              footer: "© 2025 GuruMitra. All Rights Reserved.",
            }
          );
          mailerUtils.sendEmail(
            "Account Deactivated",
            emailTemplateHtml,
            user.email
          );
          res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER003,
          message: " Invalid login",
          });
          return;
        }
      }

      
      const payload = {
        id: user.userId,
        name: user.username,
        email: user.email,
        roleId: String(user.roleId),
        level: user.level !== undefined ? String(user.level) : "",
        userEmail: user.email,
      };

      const tokenDetails = await userService.generateLoginToken(payload);
      await userService.resetInvalidLoginAttempts(user.email, user.userId);
      await userService.updateUserStatus(
        UserStatus.LOGGED_IN,
        user.email,
        user.invalidLoginAttempts > 0
      );

      res.status(HttpStatusCodes.OK).json({
        data: tokenDetails,
        message: "Login successful"
      });
      
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.User.USER000)
      );
    }
  },

  
  logout: async (req: Request, res: Response): Promise<void> => {
    try {
      /*  
            #swagger.tags = ['Users']
            #swagger.summary = 'Logout User'
            #swagger.description = 'Endpoint to Logout Users'
            #swagger.parameters['Authorization'] = {
                in: 'header',
                required: true,
                type: 'string',
                description: 'JWT token for authentication'
            }
        */
      const userEmail = req.plainToken?.email;
      const userId = req.plainToken?.id;

      if (userEmail) {
        await userService.updateUserStatus(UserStatus.LOGGED_OUT, userEmail);
      }

      await userService.clearCacheForUser(userId, userEmail);

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Logout successful"
      });
    } catch (error) {
      logger.error(`logout :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.User.USER000)
      );
    }
  },

  
  requestResetPassword: async (req: Request, res: Response): Promise<void> => {
    const { emailId } = req.body;
    try {
      logger.info(`requestResetPassword :: ${emailId}`);
      
      /*
                #swagger.tags = ['Teachers']
                #swagger.summary = 'Request Reset Password'
                #swagger.description = 'Endpoint for Request Reset Password'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                        emailId: 'teacher@example.com',
                    }
                }
      */
 
      const { error } = await userValidations.validatRequestPasswordDetails({ emailId });
      if (error) {
        const message = error.details?.[0]?.message || error.message;
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER000,
          message
          });
          return;

      }

      const user = await userService.getUserByEmail(emailId);
      if (user) {
        await userService.getRequestResetPassword(user);
      }

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Password reset instructions sent"
      });
    } catch (error) {
      logger.error(`requestResetPassword :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.User.USER000)
      );
    }
  },

  
  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const resetData = req.body;
    try {
      logger.info(`resetPassword :: txnId: ${resetData.txnId}`);
      
      /*
                #swagger.tags = ['Teachers']
                #swagger.summary = 'Request Forgot Password'
                #swagger.description = 'Endpoint for Request Forgot Password'
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
      

      const { error } = await userValidations.validateResetPassword(resetData);
      if (error) {
        const message = error.details?.[0]?.message || error.message;
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER000,
          message: " Internal server",
          });
          return;
      }


      if (environment.decryptSensitiveData) {
        resetData.newPassword = encDecHelper.decryptPayload(resetData.newPassword);
        resetData.confirmPassword = encDecHelper.decryptPayload(resetData.confirmPassword);
      }

      
      if (resetData.newPassword !== resetData.confirmPassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER004,
          message: " password does not match",
          });
          return;
      }

      if (!/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(resetData.newPassword)) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER005,
          message: "",
          });
          return;
      }

   
      const resetDetails = await userService.getResetPasswordDetails(resetData.txnId);
      if (!resetDetails) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER006,
          message: " Invalid reset password request",
          });
          return;
      }

      const { userEmail } = JSON.parse(resetDetails);
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER009,
          message: " Invalid request",
          });
          return;
      }


      const isSamePassword = await bcrypt.compare(resetData.newPassword, user.password);
      if (isSamePassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER001,
          message: " new password cannot be same",
          });
          return;
      }

 
      const newPasswordHash = await bcrypt.hash(resetData.newPassword, 10);
      const success = await userService.updatePassword(
        user.email,
        user.userId,
        resetData.txnId,
        newPasswordHash
      );

      if (!success) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            code: ErrorCodes.User.USER008,
          message: " invalid password reset",
          });
          return;
      }

      res.status(HttpStatusCodes.OK).json({
        data: null,
        message: "Password updated successfully"
      });
    } catch (error) {
      logger.error(`resetPassword :: ${error.message}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
        JSON.parse(ErrorCodes.User.USER000)
      );
    }
  },

  
  downloadApk: async (req: Request, res: Response): Promise<void> => {
    const apkFilePath = path.join(__dirname, "../../public/app-debug.apk");
    res.download(apkFilePath, "GuruMitra.apk", (err) => {
      if (err) {
        logger.error(`downloadApk :: ${err.message}`);
        res.status(500).json({ message: "APK download failed" });
      }
    });
  }
};

export default userController;