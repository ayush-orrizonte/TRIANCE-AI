import { LoggerUtils, pg } from "../../triance-commons";
import { IUser } from "../../types/custom";
import { UserStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg"; 

const logger = LoggerUtils.getLogger("userRepository");


const userRepository = {
 
  getUserById: async (userId: string): Promise<IUser | null> => {
    const logPrefix = `getUserById :: ${userId}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        SELECT user_id AS "userId", username, email, role_id AS "roleId", 
               level, status, invalid_login_attempts AS "invalidLoginAttempts"
        FROM users
        WHERE user_id = $1 
          AND status NOT IN ($2, $3)
      `;
      
      const params = [
        userId, 
        UserStatus.INACTIVE, 
        UserStatus.DELETED
      ];
      
      const result = await pgClient.executeQuery<IUser>(query, params);
      return result[0] || null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  getUserByEmail: async (email: string): Promise<IUser | null> => {
    const logPrefix = `getUserByEmail :: ${email}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        SELECT user_id AS "userId", username, email, password, role_id AS "roleId", 
               level, status, invalid_login_attempts AS "invalidLoginAttempts"
        FROM users
        WHERE email = $1 
          AND status NOT IN ($2, $3)
      `;
      
      const params = [
        email, 
        UserStatus.INACTIVE, 
        UserStatus.DELETED
      ];
      
      const result = await pgClient.executeQuery<IUser>(query, params);
      return result[0] || null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  incrementInvalidLoginAttempts: async (email: string): Promise<void> => {
    const logPrefix = `incrementInvalidLoginAttempts :: ${email}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE users
        SET invalid_login_attempts = invalid_login_attempts + 1
        WHERE email = $1
      `;
      
      await pgClient.executeQuery(query, [email]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

 
  resetInvalidLoginAttempts: async (email: string): Promise<void> => {
    const logPrefix = `resetInvalidLoginAttempts :: ${email}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE users
        SET invalid_login_attempts = 0
        WHERE email = $1
      `;
      
      await pgClient.executeQuery(query, [email]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  updateUserStatus: async (
    status: UserStatus,
    email: string,
    clearInvalidAttempts: boolean = false
  ): Promise<void> => {
    const logPrefix = `updateUserStatus :: ${status} :: ${email}`;
    try {
      logger.info(logPrefix);
      
      let query = `
        UPDATE users
        SET status = $1
      `;
      
      const params: any[] = [status, email];
      
      
      if (clearInvalidAttempts) {
        query += `, invalid_login_attempts = 0`;
      }
      
      if (status === UserStatus.LOGGED_IN) {
        query += `, last_login_time = NOW()`;
      }
      
      query += ` WHERE email = $2`;
      
      await pgClient.executeQuery(query, params);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  
  resetPassword: async (
    newPassword: string,
    userId: string
  ): Promise<boolean> => {
    const logPrefix = `resetPassword :: ${userId}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE users
        SET password = $1
        WHERE user_id = $2
      `;
      
      await pgClient.executeQuery(query, [newPassword, userId]);
      return true;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
  
  
  updateUserStatusByEmail: async (
    email: string,
    status: UserStatus
  ): Promise<void> => {
    const logPrefix = `updateUserStatusByEmail :: ${email} :: ${status}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE users
        SET status = $1
        WHERE email = $2
      `;
      
      await pgClient.executeQuery(query, [status, email]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
};

export default userRepository;