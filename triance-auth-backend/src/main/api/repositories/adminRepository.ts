import { LoggerUtils } from "../../triance-commons";
import { IAdmin } from "../../types/custom";
import { AdminStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg";
import { adminQueries } from "../../enums/pgQueriesEnum";

const logger = LoggerUtils.getLogger("adminRepository");

const adminRepository = {
  getAdminById: async (adminId: number): Promise<IAdmin | null> => {
    const logPrefix = `getAdminById :: ${adminId}`;
    try {
      logger.info(logPrefix);
      
      const result = await pgClient.executeQuery<IAdmin>(
                adminQueries.GET_ADMIN_BY_ID,
                [adminId, AdminStatus.INACTIVE, AdminStatus.DELETED]
            );
            return result.length ? result[0] : null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
  getAdminByEmail: async (adminEmail: string): Promise<IAdmin | null> => {
    const logPrefix = `getAdminByEmail :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      const result = await pgClient.executeQuery<IAdmin>(
                adminQueries.GET_ADMIN_BY_EMAIL,
                [adminEmail, AdminStatus.INACTIVE, AdminStatus.DELETED]
            );
            return result.length ? result[0] : null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  incrementInvalidLoginAttempts: async (adminEmail: string): Promise<void> => {
    const logPrefix = `incrementInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      await pgClient.executeQuery(adminQueries.INCREMENT_INVALID_LOGIN, [adminEmail]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  resetInvalidLoginAttempts: async (adminEmail: string): Promise<void> => {
    const logPrefix = `resetInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      await pgClient.executeQuery(adminQueries.RESET_INVALID_LOGIN, [adminEmail]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  updateAdminStatus: async (
    status: AdminStatus,
    adminEmail: string,
    clearInvalidAttempts: boolean = false
  ): Promise<void> => {
    const logPrefix = `updateAdminStatus :: ${status} :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      let query = adminQueries.UPDATE_ADMIN_STATUS;
            const params: any[] = [status, adminEmail];

            // if (clearInvalidAttempts) query += `, invalid_login_attempts = 0`;
            // if (status === AdminStatus.LOGGED_IN) query += `, last_login_time = NOW()`;

            await pgClient.executeQuery(query, params);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  resetPassword: async (
    newPassword: string,
    adminId: number
  ): Promise<boolean> => {
    const logPrefix = `resetPassword :: ${adminId}`;
    try {
      logger.info(logPrefix);
      
      await pgClient.executeQuery(adminQueries.RESET_PASSWORD, [newPassword, adminId]);
            return true;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
  listActiveAdmins: async (): Promise<IAdmin[]> => {
    const logPrefix = `listActiveAdmins`;
    try {
      logger.info(logPrefix);
      
      return await pgClient.executeQuery<IAdmin>(adminQueries.LIST_ACTIVE_ADMINS, [AdminStatus.ACTIVE]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  }
};

export default adminRepository;
