import { RedisKeys } from "../../enums";
import { redisKeysFormatter } from "../../helpers";
import { IRole } from "../../types/custom";
import rolesRepository from "../repositories/rolesRepository";
import { CacheTTL, LoggerUtils, RedisUtils } from "../../triance-commons";
import { RoleStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg"; 

const logger = LoggerUtils.getLogger("rolesService");
const redisUtils = RedisUtils.getInstance();

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const rolesService = {
    listRoles: async (
        isActive: boolean,
        pageSize: number,
        currentPage: number,
        roleId: number,
        searchFilter?: string
    ): Promise<IRole[]> => {
        const logPrefix = `listRoles :: isActive: ${isActive}, pageSize: ${pageSize}, currentPage: ${currentPage}, roleId: ${roleId}, searchFilter: ${searchFilter}`;
        try {
            logger.info(logPrefix);

            let key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_LIST, {
                isActive: isActive.toString(),
                pageSize: pageSize.toString(),
                currentPage: currentPage.toString(),
                roleId: roleId.toString(),
                searchFilter: searchFilter || ""
            });

            const cachedResult = await redisUtils.get(key);
            if (cachedResult) {
                logger.debug(`${logPrefix} :: Returning cached result`);
                return JSON.parse(cachedResult);
            }

            let whereClause = `WHERE role_id NOT IN (1, ${roleId})`;
            if (isActive) {
                whereClause += ` AND status = ${RoleStatus.ACTIVE}`;
            } else {
                whereClause += ` AND status IN (${RoleStatus.ACTIVE}, ${RoleStatus.INACTIVE})`;
            }

            if (searchFilter) {
                whereClause += ` AND role_name ILIKE '%${searchFilter}%'`;
            }

            const limitClause = `LIMIT ${pageSize} OFFSET ${currentPage}`;

            const result = await rolesRepository.listRoles(whereClause, limitClause);
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);

            if (result.length > 0) {
                redisUtils.set(key, JSON.stringify(result), CacheTTL.MID);
            }

            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in listRoles");
        }
    },

    listRolesCount: async (
        isActive: boolean,
        roleId: number,
        searchFilter?: string
    ): Promise<number> => {
        const logPrefix = `listRolesCount :: isActive: ${isActive}, roleId: ${roleId}, searchFilter: ${searchFilter}`;
        try {
            logger.info(logPrefix);

            let key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_COUNT, {
                isActive: isActive.toString(),
                roleId: roleId.toString(),
                searchFilter: searchFilter || ""
            });

            const cachedResult = await redisUtils.get(key);
            if (cachedResult) {
                logger.debug(`${logPrefix} :: Returning cached result`);
                return parseInt(cachedResult);
            }

            let whereClause = `WHERE role_id NOT IN (1, ${roleId})`;
            if (isActive) {
                whereClause += ` AND status = ${RoleStatus.ACTIVE}`;
            } else {
                whereClause += ` AND status IN (${RoleStatus.ACTIVE}, ${RoleStatus.INACTIVE})`;
            }

            if (searchFilter) {
                whereClause += ` AND role_name ILIKE '%${searchFilter}%'`;
            }

            const count = await rolesRepository.listRolesCount(whereClause);
            logger.debug(`${logPrefix} :: DB result count: ${count}`);

            redisUtils.set(key, count.toString(), CacheTTL.MID);

            return count;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in listRolesCount");
        }
    },

    updateRoleStatus: async (
        roleId: number,
        status: number,
        updatedBy: number
    ): Promise<void> => {
        const logPrefix = `updateRoleStatus :: roleId: ${roleId}, status: ${status}, updatedBy: ${updatedBy}`;
        try {
            logger.info(logPrefix);

            await rolesRepository.updateRoleStatus(roleId, status, updatedBy);
            await rolesService.clearRedisCache(roleId);

            logger.debug(`${logPrefix} :: Role status updated successfully`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in updateRoleStatus");
        }
    },

    addRole: async (role: IRole): Promise<number> => {
        const logPrefix = `addRole :: ${JSON.stringify(role)}`;
        try {
            logger.info(logPrefix);

            const createdRole = await rolesRepository.addRole(role);
            const roleId = createdRole[0].role_id;

            if (role.permissions && role.permissions.length > 0) {
                for (const permission of role.permissions) {
                    await rolesRepository.addPermission(
                        roleId,
                        permission.menu_id,
                        permission.permission_id,
                        role.updated_by
                    );
                }
            }

            await rolesService.clearRedisCache(roleId);

            logger.debug(`${logPrefix} :: Role added successfully with ID: ${roleId}`);
            return roleId;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in addRole");
        }
    },

    updateRole: async (role: IRole): Promise<void> => {
        const logPrefix = `updateRole :: ${JSON.stringify(role)}`;
        try {
            logger.info(logPrefix);

            await rolesRepository.updateRole(role);

            if (role.permissions && role.permissions.length > 0) {
                await rolesRepository.deleteExistingPermissions(role.role_id);
                for (const permission of role.permissions) {
                    await rolesRepository.addPermission(
                        role.role_id,
                        permission.menu_id,
                        permission.permission_id,
                        role.updated_by
                    );
                }
            }

            await rolesService.clearRedisCache(role.role_id);

            logger.debug(`${logPrefix} :: Role updated successfully`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in updateRole");
        }
    },

    getDefaultAccessList: async (): Promise<any[]> => {
        const logPrefix = "getDefaultAccessList";
        try {
            logger.info(logPrefix);

            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.DEFAULT_ACCESS_LIST, {});
            const cachedResult = await redisUtils.get(key);
            if (cachedResult) {
                logger.debug(`${logPrefix} :: Returning cached result`);
                return JSON.parse(cachedResult);
            }

            const result = await rolesRepository.getDefaultAccessList();
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);

            if (result.length > 0) {
                redisUtils.set(key, JSON.stringify(result), CacheTTL.LONG);
            }

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
            logger.info(logPrefix);

            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.COMBINED_ACCESS_BY_ROLE_ID, {
                roleId: roleId.toString()
            });
            const cachedResult = await redisUtils.get(key);
            if (cachedResult) {
                logger.debug(`${logPrefix} :: Returning cached result`);
                return JSON.parse(cachedResult);
            }

            const result = await rolesRepository.getCombinedAccess(roleId);
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);

            if (result.length > 0) {
                redisUtils.set(key, JSON.stringify(result), CacheTTL.MID);
            }

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
            logger.info(logPrefix);

            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ACCESS_LIST_BY_ROLE_ID, {
                roleId: roleId.toString()
            });
            const cachedResult = await redisUtils.get(key);
            if (cachedResult) {
                logger.debug(`${logPrefix} :: Returning cached result`);
                return JSON.parse(cachedResult);
            }

            const result = await rolesRepository.getAccessListByRoleId(roleId);
            logger.debug(`${logPrefix} :: DB result count: ${result.length}`);

            if (result.length > 0) {
                redisUtils.set(key, JSON.stringify(result), CacheTTL.MID);
            }

            return result;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in getAccessListByRoleId");
        }
    },

    clearRedisCache: async (roleId?: number): Promise<void> => {
        const logPrefix = `clearRedisCache :: roleId: ${roleId}`;
        try {
            logger.info(logPrefix);

            const keysToDelete = [
                redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_LIST, {}),
                redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_COUNT, {}),
                redisKeysFormatter.getFormattedRedisKey(RedisKeys.DEFAULT_ACCESS_LIST, {}),
            ];

            if (roleId) {
                keysToDelete.push(
                    redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLE_BY_ID, {
                        roleId: roleId.toString()
                    }),
                    redisKeysFormatter.getFormattedRedisKey(RedisKeys.ACCESS_LIST_BY_ROLE_ID, {
                        roleId: roleId.toString()
                    }),
                    redisKeysFormatter.getFormattedRedisKey(RedisKeys.COMBINED_ACCESS_BY_ROLE_ID, {
                        roleId: roleId.toString()
                    })
                );
            }

            // await redisUtils.deleteMultiple(keysToDelete);
            logger.debug(`${logPrefix} :: Cleared cache for ${keysToDelete.length} keys`);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred in clearRedisCache");
        }
    }
};

export default rolesService;