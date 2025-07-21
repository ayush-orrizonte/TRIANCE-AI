import { LoggerUtils } from "../../triance-commons/src/audit/loggerUtils";
import { pgQueries } from "../../enums";
import { IAdmin } from "../../types/custom";
import { AdminStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg";

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("adminRepository");

interface QueryResult {
    rows: any[];
    rowCount?: number;
}

const adminRepository = {
    createAdmin: async (admin: IAdmin): Promise<number> => {
        const logPrefix = `adminRepository :: createAdmin :: admin :: ${JSON.stringify(admin)}`;
        try {
            const result = await pgClient.executeQuery<{admin_id: number}>(
                pgQueries.AdminQueries.CREATE_ADMIN,
                [
                    admin.admin_name, 
                    admin.admin_email, 
                    admin.password,
                    admin.invalidlogin_attempts || 0,
                    admin.status || AdminStatus.ACTIVE,
                    admin.role_id,
                    admin.level
                ]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
            return result[0]?.admin_id;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    existsByAdminEmail: async (adminEmail: string, excludeAdminId?: number): Promise<boolean> => {
        const logPrefix = `adminRepository :: existsByAdminEmail :: email :: ${adminEmail} :: excludeId :: ${excludeAdminId}`;
        try {
            let query = `SELECT EXISTS (SELECT 1 FROM m_admin WHERE admin_email = $1)`;
            const values: (string | number)[] = [adminEmail];
            
            if (excludeAdminId !== undefined) {
                query = query.replace(")", ` AND admin_id <> $${values.length + 1})`);
                values.push(excludeAdminId);
            }

            logger.debug(`${logPrefix} :: query :: ${query} :: values :: ${JSON.stringify(values)}`);
            const result = await pgClient.executeQuery<{exists: boolean}>(query, values);
            return result.length > 0 ? result[0].exists : false;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    existsByAdminId: async (adminId: number): Promise<boolean> => {
        const logPrefix = `adminRepository :: existsByAdminId :: adminId :: ${adminId}`;
        try {
            const result = await pgClient.executeQuery<{exists: boolean}>(
                pgQueries.AdminQueries.EXISTS_BY_ADMIN_ID,
                [adminId]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
            return result.length > 0 ? result[0].exists : false;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    updateAdmin: async (admin: IAdmin): Promise<void> => {
        const logPrefix = `adminRepository :: updateAdmin :: admin :: ${JSON.stringify(admin)}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.AdminQueries.UPDATE_ADMIN,
                [
                    admin.admin_name,
                    admin.admin_email,
                    admin.profile_picture || null,
                    admin.role_id,
                    admin.level,
                    admin.admin_id
                ]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    listAdmins: async (pageSize: number, currentPage: number, searchQuery: string): Promise<IAdmin[]> => {
        const logPrefix = `adminRepository :: listAdmins :: pageSize: ${pageSize}, currentPage: ${currentPage}, search: ${searchQuery}`;
        try {
            let query = pgQueries.AdminQueries.ADMINS_LIST as string;
            const values: any[] = [];

            if (searchQuery) {
                query = query.replace(
                    "ORDER BY admin_name", 
                    `WHERE (admin_name ILIKE $1 OR admin_email ILIKE $1) ORDER BY admin_name`
                );
                values.push(`%${searchQuery}%`);
            }

            if (pageSize && currentPage >= 0) {
                query += ` LIMIT ${pageSize} OFFSET ${currentPage}`;
            }

            logger.debug(`${logPrefix} :: query :: ${query} :: values :: ${JSON.stringify(values)}`);
            const result = await pgClient.executeQuery<IAdmin>(query, values);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },
   
    getAdminById: async (adminId: number): Promise<IAdmin | null> => {
        const logPrefix = `adminRepository :: getAdminById :: adminId :: ${adminId}`;
        try {
            const result = await pgClient.executeQuery<IAdmin>(
                pgQueries.AdminQueries.GET_ADMIN_BY_ID,
                [adminId]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
            return result.length ? result[0] : null;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },
    
    updateAdminStatus: async (adminId: number, status: AdminStatus, updatedBy: number): Promise<void> => {
        const logPrefix = `adminRepository :: updateAdminStatus :: adminId :: ${adminId} :: status :: ${status}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.AdminQueries.UPDATE_ADMIN_STATUS,
                [status, adminId]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    getAdminsByRoleId: async (roleId: number): Promise<IAdmin[]> => {
        const logPrefix = `adminRepository :: getAdminsByRoleId :: roleId :: ${roleId}`;
        try {
            const result = await pgClient.executeQuery<IAdmin>(
                pgQueries.AdminQueries.GET_ADMIN_BY_ROLE_ID,
                [roleId]
            );
            logger.debug(`${logPrefix} :: db result count :: ${result.length}`);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    resetPasswordForAdminId: async (adminId: number): Promise<void> => {
        const logPrefix = `adminRepository :: resetPasswordForAdminId :: adminId :: ${adminId}`;
        try {
            // Generate a random password or use default one
            const defaultPassword = "reset@123"; // In production, use proper password generation
            const result = await pgClient.executeQuery(
                pgQueries.AdminQueries.RESET_PASSWORD_FOR_ADMIN_ID,
                [defaultPassword, adminId]
            );
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    updateLoginAttempts: async (adminId: number, invalidlogin_attempts: number): Promise<void> => {
        const logPrefix = `adminRepository :: updateLoginAttempts :: adminId :: ${adminId} :: attempts :: ${invalidlogin_attempts}`;
        try {
            const query = `UPDATE m_admin SET invalid_login_attempts = $1 WHERE admin_id = $2`;
            const result = await pgClient.executeQuery(query, [invalidlogin_attempts, adminId]);
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    updateLastLogin: async (adminId: number): Promise<void> => {
        const logPrefix = `adminRepository :: updateLastLogin :: adminId :: ${adminId}`;
        try {
            const query = `UPDATE m_admin SET lastLogin_time = NOW() WHERE admin_id = $1`;
            const result = await pgClient.executeQuery(query, [adminId]);
            logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

    getAdminsCount: async (searchQuery: string): Promise<number> => {
    const logPrefix = `adminRepository :: getAdminsCount :: searchQuery :: ${searchQuery}`;
    try {
        let query = pgQueries.AdminQueries.ADMINS_COUNT as string;
        const values: any[] = [];

        if (searchQuery) {
            query = query.replace("FROM m_admin", `FROM m_admin WHERE (admin_name ILIKE $1 OR admin_email ILIKE $1)`);
            values.push(`%${searchQuery}%`);
        }

        logger.debug(`${logPrefix} :: query :: ${query} :: values :: ${JSON.stringify(values)}`);
        const result = await pgClient.executeQuery<{count: string}>(query, values);
        return parseInt(result[0]?.count || '0', 10);
    } catch (error: unknown) {
        if (isError(error)) {
            logger.error(`${logPrefix} :: Error :: ${error.message}`);
            throw new Error(error.message);
        }
        throw new Error('Unknown error occurred');
    }
},
};

export default adminRepository;