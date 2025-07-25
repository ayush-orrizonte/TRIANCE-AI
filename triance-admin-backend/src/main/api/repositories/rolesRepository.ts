import { LoggerUtils } from "../../triance-commons/src/audit/loggerUtils";
import { pgQueries } from "../../enums";
import { IRole } from "../../types/custom";
import { RoleStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg";

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("rolesRepository");

const rolesRepository = {
    getRoleById: async (roleId: number): Promise<IRole | null> => {
        const logPrefix = `getRoleById :: roleId: ${roleId}`;
        try {
            const result = await pgClient.executeQuery<IRole>(
                pgQueries.RoleQueries.GET_ROLE,
                [roleId]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
            return result.length ? result[0] : null;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getRoleById");
        }
    },

    updateRoleStatus: async (
        roleId: number,
        status: number,
        updatedBy: number
    ): Promise<void> => {
        const logPrefix = `updateRoleStatus :: roleId: ${roleId}, status: ${status}, updatedBy: ${updatedBy}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.UPDATE_ROLE_STATUS,
                [updatedBy, status, roleId]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
        } catch (error: unknown) {  
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in updateRoleStatus");
        }
    },

    existsByRoleId: async (roleId: number): Promise<boolean> => {
        const logPrefix = `existsByRoleId :: roleId: ${roleId}`;
        try {
            const result = await pgClient.executeQuery<{exists: boolean}>(
                pgQueries.RoleQueries.EXISTS_BY_ROLE_ID,
                [roleId]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
            return result.length > 0 ? result[0].exists : false;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in existsByRoleId");
        }
    },

    existsByRoleName: async (
        roleName: string,
        excludeRoleId?: number
    ): Promise<boolean> => {
        const logPrefix = `existsByRoleName :: roleName: ${roleName}, excludeRoleId: ${excludeRoleId}`;
        try {
            let query = pgQueries.RoleQueries.EXISTS_BY_ROLE_NAME as string;
            const values: (string | number)[] = [roleName];

            if (excludeRoleId !== undefined) {
                query = query.replace(")", ` AND role_id <> $${values.length + 1})`);
                values.push(excludeRoleId);
            }

            logger.debug(`${logPrefix} :: Query: ${query}, Values: ${JSON.stringify(values)}`);
            const result = await pgClient.executeQuery<{exists: boolean}>(query, values);
            return result.length > 0 ? result[0].exists : false;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in existsByRoleName");
        }
    },

    addRole: async (role: IRole): Promise<IRole[]> => {
        const logPrefix = `addRole :: ${JSON.stringify(role)}`;
        try {
            const result = await pgClient.executeQuery<IRole>(
                pgQueries.RoleQueries.ADD_ROLE,
                [
                    role.role_name,
                    role.role_description,
                    role.level,
                    role.status || RoleStatus.ACTIVE,
                    role.created_by,
                    role.updated_by
                ]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in addRole");
        }
    },

    addPermission: async (
        roleId: number,
        menuId: number,
        permissionId: number,
        updatedBy: number | undefined
    ): Promise<void> => {
        const logPrefix = `addPermission :: roleId: ${roleId}, menuId: ${menuId}, permissionId: ${permissionId}, updatedBy: ${updatedBy}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.ADD_PERMISSIONS,
                [roleId, menuId, permissionId, updatedBy]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in addPermission");
        }
    },

    updateRole: async (role: IRole): Promise<void> => {
        const logPrefix = `updateRole :: ${JSON.stringify(role)}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.UPDATE_ROLE,
                [
                    role.role_id,
                    role.role_name,
                    role.role_description,
                    role.level,
                    role.updated_by,
                    
                ]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in updateRole");
        }
    },

    deleteExistingPermissions: async (roleId: number): Promise<void> => {
        const logPrefix = `deleteExistingPermissions :: roleId: ${roleId}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.DELETE_EXISTING_PERMISSIONS,
                [roleId]
            );
            logger.debug(`${logPrefix} :: DB result: ${JSON.stringify(result)}`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in deleteExistingPermissions");
        }
    },

    getMenusList: async (isActive?: boolean): Promise<any[]> => {
        const logPrefix = `getMenusList :: isActive: ${isActive}`;
        try {
            let query = pgQueries.RoleQueries.GET_MENUS_LIST as string;
            if (isActive) {
                query += " WHERE status = 1";
            }
            query += " ORDER BY menu_order ASC";

            logger.debug(`${logPrefix} :: Query: ${query}`);
            const result = await pgClient.executeQuery(query);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getMenusList");
        }
    },

    getDefaultAccessList: async (): Promise<any[]> => {
        const logPrefix = "getDefaultAccessList";
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.GET_DEFAULT_ACCESS_LIST
            );
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getDefaultAccessList");
        }
    },

    getCombinedAccess: async (roleId: number): Promise<any[]> => {
        const logPrefix = `getCombinedAccess :: roleId: ${roleId}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.GET_COMBINED_ACCESS_BY_ROLE_ID,
                [roleId]
            );
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getCombinedAccess");
        }
    },

    getAccessListByRoleId: async (roleId: number): Promise<any[]> => {
        const logPrefix = `getAccessListByRoleId :: roleId: ${roleId}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.RoleQueries.GET_ACCESS_LIST_BY_ROLE_ID,
                [roleId]
            );
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);
            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getAccessListByRoleId");
        }
    },

    listRoles: async (
    isActive: boolean = true,
    pageSize: number,
    currentPage: number,
    searchFilter: string
  ): Promise<IRole[]> => {
    const logPrefix = `rolesRepository :: listRoles`;
    try {
      const query = pgQueries.RoleQueries.LIST_ROLES;
      const values: any[] = [];

        const search = searchFilter ? `%${searchFilter}%` : "%%";
        values.push(search);        // $1 = search
        values.push(pageSize);      // $2 = limit
        values.push(currentPage);   // $3 = offset

        const result = await pgClient.executeQuery<IRole>(query, values);

      return result;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  listRolesCount: async (searchFilter: string, isActive :boolean): Promise<number> => {
    const logPrefix = `rolesRepository :: listRolesCount`;
    try {
      const result = await pgClient.executeQuery<{ count: number }>(
      pgQueries.RoleQueries.LIST_ROLES_COUNT,
      [`%${searchFilter}%`] // Only one parameter: $1 for ILIKE
    );

    return result[0]?.count ?? 0;

    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },
};

export default rolesRepository;