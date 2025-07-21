import { LoggerUtils } from "../../triance-commons";
import { IAdmin } from "../../types/custom";
import { AdminStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg";

const logger = LoggerUtils.getLogger("adminRepository");

const adminRepository = {
  getAdminById: async (adminId: number): Promise<IAdmin | null> => {
    const logPrefix = `getAdminById :: ${adminId}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        SELECT admin_id AS "admin_id", admin_name AS "admin_name", 
               admin_email AS "admin_email", password, role_id AS "role_id", 
               level, status, invalid_login_attempts AS "invalid_login_attempts",
               profile_picture AS "profile_picture", last_login_time AS "last_login_time"
        FROM m_admin
        WHERE admin_id = $1 
          AND status NOT IN ($2, $3)
      `;
      
      const params = [
        adminId, 
        AdminStatus.INACTIVE, 
        AdminStatus.DELETED
      ];
      
      const result = await pgClient.executeQuery<IAdmin>(query, params);
      return result[0] || null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },
  getAdminByEmail: async (adminEmail: string): Promise<IAdmin | null> => {
    const logPrefix = `getAdminByEmail :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        SELECT admin_id AS "admin_id", admin_name AS "admin_name", 
               admin_email AS "admin_email", password, role_id AS "role_id", 
               level, status, invalid_login_attempts AS "invalid_login_attempts",
               profile_picture AS "profile_picture", last_login_time AS "last_login_time"
        FROM m_admin
        WHERE admin_email = $1 
          AND status NOT IN ($2, $3)
      `;
      
      const params = [
        adminEmail, 
        AdminStatus.INACTIVE, 
        AdminStatus.DELETED
      ];
      
      const result = await pgClient.executeQuery<IAdmin>(query, params);
      return result[0] || null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  incrementInvalidLoginAttempts: async (adminEmail: string): Promise<void> => {
    const logPrefix = `incrementInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE m_admin
        SET invalid_login_attempts = invalid_login_attempts + 1,
            last_login_time = NOW()
        WHERE admin_email = $1
      `;
      
      await pgClient.executeQuery(query, [adminEmail]);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  },

  resetInvalidLoginAttempts: async (adminEmail: string): Promise<void> => {
    const logPrefix = `resetInvalidLoginAttempts :: ${adminEmail}`;
    try {
      logger.info(logPrefix);
      
      const query = `
        UPDATE m_admin
        SET invalid_login_attempts = 0
        WHERE admin_email = $1
      `;
      
      await pgClient.executeQuery(query, [adminEmail]);
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
      
      let query = `
        UPDATE m_admin
        SET status = $1
      `;
      
      const params: any[] = [status, adminEmail];
      
      if (clearInvalidAttempts) {
        query += `, invalid_login_attempts = 0`;
      }
      
      if (status === AdminStatus.LOGGED_IN) {
        query += `, last_login_time = NOW()`;
      }
      
      query += ` WHERE admin_email = $2`;
      
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
      
      const query = `
        UPDATE m_admin
        SET password = $1
        WHERE admin_id = $2
      `;
      
      await pgClient.executeQuery(query, [newPassword, adminId]);
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
      
      const query = `
        SELECT admin_id AS "admin_id", admin_name AS "admin_name", 
               admin_email AS "admin_email", role_id AS "role_id", 
               level, status, profile_picture AS "profile_picture"
        FROM m_admin
        WHERE status = $1
        ORDER BY admin_name
      `;
      
      const result = await pgClient.executeQuery<IAdmin>(query, [AdminStatus.ACTIVE]);
      return result;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      throw error;
    }
  }
};

export default adminRepository;