import {
  CacheTTL,
  EjsUtils,
  JwtUtils,
  LoggerUtils,
  MailerUtils,
  RedisUtils,
} from "../../triance-commons";
import { IPasswordPolicy, IUser } from "../../types/custom";
import { redisKeysFormatter } from "../../helpers";
import { RedisKeys } from "../../enums";
import { userRepository } from "../repositories";
import { UserStatus } from "../../enums/status";
import { environment } from "../../config";
import { PlainToken } from "../../types/express";
import { v4 as uuidv4 } from "uuid";

const logger = LoggerUtils.getLogger("userService");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

const userService = {
  
  getUserById: async (userId: string): Promise<IUser | null> => {
    const logPrefix = `getUserById :: ${userId}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_BY_ID,
        { userId }
      );
      
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: cache hit`);
        return JSON.parse(cachedResult);
      }

      const user = await userRepository.getUserById(userId);
      if (user) {
        redisUtils.set(key, JSON.stringify(user), CacheTTL.LONG);
      }
      return user;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getUserByEmail: async (userEmail: string): Promise<IUser | null> => {
    const logPrefix = `getUserByEmail :: ${userEmail}`;
    try {
      logger.info(logPrefix);
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_BY_EMAIL,
        { userEmail }
      );
      
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(`${logPrefix} :: cache hit`);
        return JSON.parse(cachedResult);
      }

      const user = await userRepository.getUserByEmail(userEmail);
      if (user) {
        redisUtils.set(key, JSON.stringify(user), CacheTTL.LONG);
      }
      return user;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updateInvalidLoginAttempts: async (
    userEmail: string,
    userId: string
  ): Promise<void> => {
    const logPrefix = `updateInvalidLoginAttempts :: ${userEmail}`;
    try {
      logger.info(logPrefix);
      await userRepository.incrementInvalidLoginAttempts(userEmail);
      await userService.clearCacheForUser(userId, userEmail);
      logger.info(`${logPrefix} :: attempts updated & cache cleared`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  resetInvalidLoginAttempts: async (
    userEmail: string,
    userId: string
  ): Promise<void> => {
    const logPrefix = `resetInvalidLoginAttempts :: ${userEmail}`;
    try {
      logger.info(logPrefix);
      await userRepository.resetInvalidLoginAttempts(userEmail);
      await userService.clearCacheForUser(userId, userEmail);
      logger.info(`${logPrefix} :: attempts reset & cache cleared`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updateUserStatus: async (
    status: UserStatus,
    userEmail: string,
    clearInvalidAttempts?: boolean
  ): Promise<void> => {
    const logPrefix = `updateUserStatus :: ${status} :: ${userEmail}`;
    try {
      logger.info(logPrefix);
      await userRepository.updateUserStatus(
        status,
        userEmail,
        clearInvalidAttempts
      );
      await userService.clearCacheForUser(null, userEmail);

      if (status === UserStatus.LOGGED_OUT) {
        redisUtils.delete(userEmail);
      }
      logger.debug(`${logPrefix} :: status updated`);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  clearCacheForUser: async (
    userId?: string | null,
    userEmail?: string | null
  ): Promise<void> => {
    const logPrefix = `clearCacheForUser :: ${userId} :: ${userEmail}`;
    try {
      if (userId) {
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.USER_BY_ID, {
            userId,
          })
        );
      }
      if (userEmail) {
        await redisUtils.delete(
          redisKeysFormatter.getFormattedRedisKey(RedisKeys.USER_BY_EMAIL, {
            userEmail,
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
    user: PlainToken
  ): Promise<{ token: string; expiryTime: number }> => {
    const logPrefix = `generateLoginToken :: ${user.email}`;
    try {
      const expiryTime = environment.userLoginExpiryTime;
      const token = await JwtUtils.generateJwt(user, `${expiryTime}h`);
      await redisUtils.set(user.email, token, expiryTime * 60 * 60);
      return { token, expiryTime };
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getRequestResetPassword: async (user: IUser | null): Promise<void> => {
    const logPrefix = `getRequestResetPassword :: ${user?.email}`;
    try {
      logger.info(logPrefix);
      if (!user) {
        logger.warn(`${logPrefix} :: user not found`);
        return;
      }
      
      const resetPasswordDetails = {
        txnId: uuidv4(),
        userName: user.username,
        userEmail: user.email,
      };
      
      const redisKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_RESET_PASSWORD_BY_TXN_ID,
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
          name: user.username,
          body: "You have requested to reset your password",
          buttonName: "Reset Password",
          link: `${environment.clientUrl}/reset-password/${resetPasswordDetails.txnId}`,
          footer: "Regards, Support Team",
        }
      );

      mailerUtils.sendEmail(
        "Password Reset Request",
        emailTemplateHtml,
        user.email
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
        RedisKeys.USER_RESET_PASSWORD_BY_TXN_ID,
        { txnId }
      );
      return await redisUtils.get(redisKey);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updatePassword: async (
    userEmail: string,
    userId: string,
    txnId: string,
    passwordHash: string
  ): Promise<boolean> => {
    const logPrefix = `updatePassword :: ${userEmail}`;
    try {
      logger.info(logPrefix);
      const passwordUpdated = await userRepository.resetPassword(
        passwordHash,
        userId
      );

      await userService.clearCacheForUser(userId, userEmail);
      
      redisUtils.delete(
        redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.USER_RESET_PASSWORD_BY_TXN_ID,
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

export default userService;