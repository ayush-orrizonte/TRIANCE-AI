import {
  CacheTTL,
  EjsUtils,
  JwtUtils,
  LoggerUtils,
  MailerUtils,
  RedisUtils,
} from "gm-commons";
import { IPasswordPolicy, IAdmin, } from "../../types/custom";
import { redisKeysFormatter } from "../../helpers";
import { RedisKeys } from "../../enums";
import { PlainToken } from "../../types/express";
import { UserStatus } from "../../enums/status";
import { environment } from "../../config";
import adminRepository from "../repositories/adminRepository";
import { Request } from "../../types/express";
import { v4 as uuidv4 } from "uuid";


const logger = LoggerUtils.getLogger("adminService");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

const adminService = {
  getAdminById: async (adminId: string): Promise<IAdmin | null> => {
    const logPrefix = `getAdminById :: adminId :: ${adminId}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_BY_ID,
        { adminId }
      );
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: from cache :: ${cachedResult}`);
        return JSON.parse(cachedResult);
      }

      const admin = await adminRepository.getAdminById(adminId);
      if (admin) redisUtils.set(key, JSON.stringify(admin), CacheTTL.LONG);

      return admin;
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  getAdminByEmail: async (adminEmail: string): Promise<IAdmin | null> => {
    const logPrefix = `getAdminByEmail :: adminEmail :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_BY_EMAIL,
        { adminEmail }
      );
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: from cache :: ${cachedResult}`);
        return JSON.parse(cachedResult);
      }

      const admin = await adminRepository.getAdminByEmail(adminEmail);
      if (admin) redisUtils.set(key, JSON.stringify(admin), CacheTTL.LONG);

      return admin;
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  updateInvalidLoginAttempts: async (
    adminEmail: string,
    adminId: string
  ) => {
    const logPrefix = `updateInvalidLoginAttempts :: adminEmail :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      await adminRepository.incrementInvalidLoginAttempts(adminEmail);
      await adminService.clearCacheForAdmin(adminId, adminEmail);
      logger.info(`${logPrefix} :: Invalid attempts updated and cache cleared`);
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  updateAdminStatus: async (
    status: UserStatus,
    adminEmail: string,
    clearInvalidAttempts?: boolean
  ) => {
    const logPrefix = `updateAdminStatus :: status :: ${status} :: adminEmail :: ${adminEmail} :: clearInvalidAttempts :: ${clearInvalidAttempts}`;
    try {
      logger.info(logPrefix);
      await adminRepository.updateAdminStatus(
        status,
        adminEmail,
        clearInvalidAttempts
      );
      await adminService.clearCacheForAdmin(null, adminEmail);

      if (status === UserStatus.LOGGED_OUT) redisUtils.delete(adminEmail);
      logger.debug(`${logPrefix} :: Admin status updated`);
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  clearCacheForAdmin: async (
    adminId?: string | null,
    adminEmail?: string | null
  ) => {
    const logPrefix = `clearCacheForAdmin :: adminId :: ${adminId} :: adminEmail :: ${adminEmail}`;
    try {
      if (adminId)
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.USER_BY_ID, {
            adminId,
          })
        );
      if (adminEmail)
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.USER_BY_EMAIL, {
            adminEmail,
          })
        );
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  getPasswordPolicy: (): IPasswordPolicy =>
    JSON.parse(environment.passwordPolicy) as IPasswordPolicy,

  generateLoginToken: async (
    admin: PlainToken
  ): Promise<{ token: string; expiryTime: number }> => {
    const logPrefix = `generateLoginToken :: admin :: ${JSON.stringify(admin)}`;
    try {
      const expiryTime = environment.adminLoginExpiryTime;
      const token = await JwtUtils.generateJwt(admin, `${expiryTime}h`);
      await redisUtils.set(admin.email, token, expiryTime * 60 * 60);
      return { token, expiryTime };
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  getRequestResetPassword: async (admin: IAdmin | null) => {
    const logPrefix = `getRequestResetPassword :: admin :: ${JSON.stringify(admin)}`;
    try {
      logger.info(logPrefix);
      if (!admin) {
        logger.warn(`${logPrefix} :: admin not found`);
        return;
      }
      const resetPasswordDetails = {
        txnId: uuidv4(),
        userName: admin.userName,
        userEmail: admin.emailId,
      };
      await redisUtils.set(
        redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.USER_RESET_PASSWORD_BY_TXN_ID,
          { txnId: resetPasswordDetails.txnId }
        ),
        JSON.stringify(resetPasswordDetails),
        CacheTTL.LONG
      );
      const emailTemplateHtml = await EjsUtils.generateHtml(
        "src/main/views/generic_template.ejs",
        {
          name: admin.userName,
          body: "You have initiated the password reset request",
          buttonName: "Proceed to Reset Password",
          link: `${environment.clientUrl}/reset-password/${resetPasswordDetails.txnId}`,
          footer: "Regards, Team Guru Mitra",
        }
      );

      mailerUtils.sendEmail(
        "Guru Mitra | Reset Password Details",
        emailTemplateHtml,
        admin.emailId
      );
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  getResetPasswordDetails: async (
    txnId: string
  ): Promise<string | null> => {
    const logPrefix = `getResetPasswordDetails :: txnId :: ${txnId}`;
    try {
      logger.info(logPrefix);
      const cachedResult = await redisUtils.get(
        redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.FORGOT_PASSWORD_CHANGE_BY_TXNID,
          { txnId }
        )
      );
      logger.debug(`${logPrefix} :: cachedResult :: ${cachedResult}`);
      return cachedResult;
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },

  updatePassword: async (
    userEmail: string,
    userId: string,
    txnId: string,
    passwordHash: string
  ): Promise<boolean> => {
    const logPrefix = `updatePassword :: userEmail :: ${userEmail} :: userId :: ${userId} :: txnId :: ${txnId}`;
    try {
      logger.info(logPrefix);
      const passwordResetted = await adminRepository.resetPassword(passwordHash, userId);

      await adminService.clearCacheForAdmin(userId, userEmail);
      redisUtils.delete(
        redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.FORGOT_PASSWORD_DETAILS_BY_TXNID,
          { txnId }
        )
      );

      logger.info(`${logPrefix} :: password resetted :: ${passwordResetted}`);
      return passwordResetted;
    } catch (error) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      throw error;
    }
  },
  getForgetPasswordOtp: async (emailId: string, ): Promise<string> => {
    const logPrefix = `adminService :: getForgetPasswordOtp :: emailId :: ${emailId}`;
    try {
      const txnId = uuidv4();
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      const user = await adminService.getAdminByEmail(emailId); 
      if (!user) {
        throw new Error(`User not found with email: ${emailId}`);
      }
      const otpDetails = {
        otp,
        txnId,
        displayName: user.displayName,
        emailId: emailId,
         
      };
  
      logger.info(`${logPrefix} :: Request received for emailId: ${emailId}`);
  
      await adminService.setForgotPasswordOTPInRedis(otpDetails);
      await adminService.shareForgotOTPUserDetails(otpDetails);
  
      logger.debug(`${logPrefix} :: OTP details shared with user :: ${JSON.stringify(otpDetails)}`);
  
      return txnId;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },
  setForgotPasswordOTPInRedis: async (otpDetails: any) => {
    const logPrefix = `adminService :: setForgotPasswordOTPInRedis :: otpDetails :: ${JSON.stringify(otpDetails)}`;
    try {
        if (otpDetails) {
            const keyByEmail = redisKeysFormatter.getFormattedRedisKey(
                RedisKeys.FORGOT_PASSWORD_USER_DETAILS_BY_EMAIL,
                { email: otpDetails.emailId }
            );
            logger.info(`Setting Redis key: ${keyByEmail}`);
            await redisUtils.set(keyByEmail, JSON.stringify(otpDetails), 3 * 600);

            const keyByTxnId = redisKeysFormatter.getFormattedRedisKey(
                RedisKeys.FORGOT_PASSWORD_DETAILS_BY_TXNID,
                { txnId: otpDetails.txnId }
            );
            logger.info(`Setting Redis key: ${keyByTxnId}`);
            await redisUtils.set(keyByTxnId, JSON.stringify(otpDetails), 3 * 600);

            logger.debug(`${logPrefix} :: OTP details successfully set for email: ${otpDetails.emailId} and txnId: ${otpDetails.txnId}`);
        }
    } catch (error) {
        logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
        throw new Error(error.message);
    }
},
shareForgotOTPUserDetails: async (otpDetails: any ) => {
  const logPrefix = `adminService :: shareForgotOTPUserDetails :: emailId :: ${otpDetails.emailId}`;
  try {
    logger.debug(`${logPrefix} :: otpDetails :: ${JSON.stringify(otpDetails)}`);

    if (otpDetails.emailId && environment.enableAdminEmailForgotPwdOtp) {
      const emailTemplateHtml = await EjsUtils.generateHtml(
        'src/main/views/forgotPasswordHtmlTemplate.ejs',
        {
          name: otpDetails.displayName,
          otp : otpDetails.otp,
          link: `${environment.clientUrl}/reset-password/${otpDetails.txnId}`,
          footer: "Regards, Team Guru Mitra",
 
          
        }
      );
      await MailerUtils.getInstance().sendEmail(
        'Guru Mitra| FORGOT PASSWORD OTP',
        emailTemplateHtml,
        otpDetails.emailId
      );

      logger.debug(`${logPrefix} :: Email sent to :: ${otpDetails.emailId}`);
    } else {
      logger.warn(`${logPrefix} :: Email not sent. Email ID missing or email OTP is disabled`);
    }
  } catch (error) {
    logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
    throw new Error(error.message);
  }
},

getUserInRedisByUserName: async (userName: string): Promise<string | null> => {
  const logPrefix = `adminService :: getUserInRedisByUserName :: username :: ${userName}`;
  try {
    const key = `users|username:${userName}`;
    const data = await redisUtils.get(key);
    
    if (!data) {
      logger.warn(`${logPrefix} :: No user found in Redis for email: ${userName}`);
      return null; 
    }

    return data;
  } catch (error) {
    logger.error(`${logPrefix} :: Error retrieving user from Redis :: ${error.message}`);
    return null; 
  }
},
getForgotPasswordOtpDetails: async (txnId: string): Promise<string | null> => {
  const logPrefix = `adminService :: getForgotPasswordOtpDetails :: txnId :: ${txnId}`;
  try {
      logger.info(`${logPrefix} :: Request received for txnId: ${txnId}`);
      const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.FORGOT_PASSWORD_DETAILS_BY_TXNID, { txnId });
      logger.info(`${logPrefix} :: Looking for Redis key: ${key}`);
      const cachedResult = await redisUtils.get(key);
      logger.debug(`${logPrefix} :: Retrieved OTP details: ${cachedResult}`);
      return cachedResult;
  } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      throw new Error(error.message);
  }
},
verifyForgetPasswordOtp: async (email: string, oldTxnId: string): Promise<string> => {
  const logPrefix = `adminService :: verifyForgetPasswordOtp :: email :: ${email} :: oldTxnId :: ${oldTxnId}`;
  try {
      const txnId = uuidv4();
      const forgotPasswordUserKey = redisKeysFormatter.getFormattedRedisKey(RedisKeys.FORGOT_PASSWORD_USER_DETAILS_BY_EMAIL, { email: email });
      const forgotPasswordChangeKey = redisKeysFormatter.getFormattedRedisKey(RedisKeys.FORGOT_PASSWORD_CHANGE_BY_TXNID, { txnId });
      const forgotPasswordTxnIdKey = redisKeysFormatter.getFormattedRedisKey(RedisKeys.FORGOT_PASSWORD_DETAILS_BY_TXNID, { txnId: oldTxnId });

      await redisUtils.delete(forgotPasswordUserKey);
      await redisUtils.delete(forgotPasswordTxnIdKey);
      redisUtils.set(forgotPasswordChangeKey, JSON.stringify({ email }), CacheTTL.SHORT);
      logger.debug(`${logPrefix} :: Redis key set :: ${forgotPasswordChangeKey} :: ${JSON.stringify({ email })}`);
      return txnId;
  } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      throw new Error(error)
  }
},
};

export default adminService;