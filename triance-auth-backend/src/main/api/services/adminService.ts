import {
  CacheTTL,
  EjsUtils,
  JwtUtils,
  LoggerUtils,
  MailerUtils,
  RedisUtils,
} from "../../triance-commons";
import { IPasswordPolicy, IAdmin } from "../../types/custom";
import { redisKeysFormatter } from "../../helpers";
import { RedisKeys } from "../../enums";
import { adminRepository } from "../repositories";
import { AdminStatus } from "../../enums/status";
import { environment } from "../../config";
import { PlainToken } from "../../types/express";
import { v4 as uuidv4 } from "uuid";

const logger = LoggerUtils.getLogger("adminService");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

const adminService = {
  
  getAdminById: async (adminId: number): Promise<IAdmin | null> => {
    const logPrefix = `getAdminById :: ${adminId}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.ADMIN_BY_ID,
        { adminId: adminId.toString() }
      );
      
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: cache hit`);
        return JSON.parse(cachedResult);
      }

      const admin = await adminRepository.getAdminById(adminId);
      if (admin) {
        redisUtils.set(key, JSON.stringify(admin), CacheTTL.LONG);
      }
      return admin;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getAdminByEmail: async (adminEmail: string): Promise<IAdmin | null> => {
    const logPrefix = `getAdminByEmail :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.ADMIN_BY_EMAIL,
        { adminEmail }
      );
      
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: cache hit`);
        return JSON.parse(cachedResult);
      }

      const admin = await adminRepository.getAdminByEmail(adminEmail);
      if (admin) {
        redisUtils.set(key, JSON.stringify(admin), CacheTTL.LONG);
      }
      return admin;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updateInvalidLoginAttempts: async (
    adminEmail: string,
    adminId: number
  ): Promise<void> => {
    const logPrefix = `updateInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      await adminRepository.incrementInvalidLoginAttempts(adminEmail);
      await adminService.clearCacheForAdmin(adminId, adminEmail);
      logger.info(`${logPrefix} :: attempts updated & cache cleared`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  resetInvalidLoginAttempts: async (
    adminEmail: string,
    adminId: number
  ): Promise<void> => {
    const logPrefix = `resetInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      await adminRepository.resetInvalidLoginAttempts(adminEmail);
      await adminService.clearCacheForAdmin(adminId, adminEmail);
      logger.info(`${logPrefix} :: attempts reset & cache cleared`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updateAdminStatus: async (
    status: AdminStatus,
    adminEmail: string,
    clearInvalidAttempts?: boolean
  ): Promise<void> => {
    const logPrefix = `updateAdminStatus :: ${status} :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      await adminRepository.updateAdminStatus(
        status,
        adminEmail,
        clearInvalidAttempts
      );
      await adminService.clearCacheForAdmin(null, adminEmail);

      if (status === AdminStatus.LOGGED_OUT) {
        redisUtils.delete(adminEmail);
      }
      logger.debug(`${logPrefix} :: status updated`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  clearCacheForAdmin: async (
    adminId?: number | null,
    adminEmail?: string | null
  ): Promise<void> => {
    const logPrefix = `clearCacheForAdmin :: ${adminId} :: ${adminEmail}`;
    try {
      if (adminId) {
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMIN_BY_ID, {
            adminId: adminId.toString(),
          })
        );
      }
      if (adminEmail) {
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMIN_BY_EMAIL, {
            adminEmail,
          })
        );
      }
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getPasswordPolicy: (): IPasswordPolicy =>
    JSON.parse(environment.passwordPolicy) as IPasswordPolicy,

  
  generateLoginToken: async (
    admin: PlainToken
  ): Promise<{ token: string; expiryTime: number }> => {
    const logPrefix = `generateLoginToken :: ${admin.email}`;
    try {
      const expiryTime = environment.adminLoginExpiryTime;
      const token = await JwtUtils.generateJwt(admin, `${expiryTime}h`);
      await redisUtils.set(admin.email, token, expiryTime * 60 * 60);
      return { token, expiryTime };
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getRequestResetPassword: async (admin: IAdmin | null): Promise<void> => {
    const logPrefix = `getRequestResetPassword :: ${admin?.admin_email}`;
    try {
      logger.info(logPrefix);
      if (!admin) {
        logger.warn(`${logPrefix} :: admin not found`);
        return;
      }
      
      const resetPasswordDetails = {
        txnId: uuidv4(),
        adminName: admin.admin_name,
        adminEmail: admin.admin_email,
      };
      
      const redisKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.ADMIN_RESET_PASSWORD_BY_TXN_ID,
        { txnId: resetPasswordDetails.txnId }
      );
      
      await redisUtils.set(
        redisKey,
        JSON.stringify(resetPasswordDetails),
        CacheTTL.LONG
      );
      
      const emailTemplateHtml = await EjsUtils.generateHtml(
        "src/main/views/generic_template.ejs",
        {
          name: admin.admin_name,
          body: "You have requested to reset your admin password",
          buttonName: "Reset Password",
          link: `${environment.clientUrl}/reset-password/${resetPasswordDetails.txnId}`,
          footer: "Regards, Admin Support Team",
        }
      );

      mailerUtils.sendEmail(
        "Admin Password Reset Request",
        emailTemplateHtml,
        admin.admin_email
      );
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getResetPasswordDetails: async (txnId: string): Promise<string | null> => {
    const logPrefix = `getResetPasswordDetails :: ${txnId}`;
    try {
      logger.info(logPrefix);
      const redisKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.ADMIN_RESET_PASSWORD_BY_TXN_ID,
        { txnId }
      );
      return await redisUtils.get(redisKey);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updatePassword: async (
    adminEmail: string,
    adminId: number,
    txnId: string,
    passwordHash: string
  ): Promise<boolean> => {
    const logPrefix = `updatePassword :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      const passwordUpdated = await adminRepository.resetPassword(
        passwordHash,
        adminId
      );

      await adminService.clearCacheForAdmin(adminId, adminEmail);
      
      redisUtils.delete(
        redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.ADMIN_RESET_PASSWORD_BY_TXN_ID,
          { txnId }
        )
      );

      logger.info(`${logPrefix} :: success: ${passwordUpdated}`);
      return passwordUpdated;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
};

export default adminService;