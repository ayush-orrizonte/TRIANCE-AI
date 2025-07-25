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
        searchFilter: string
      ): Promise<IRole[]> => {
        const logPrefix = `rolesService :: listRoles`;
        try {
          const keyParts = [
            redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_LIST, { pageSize: pageSize.toString(), currentPage: currentPage.toString() }),
            `active:${isActive}`,
          ];
      
          if (searchFilter) keyParts.push(`search:${searchFilter}`);
          
          const key = keyParts.join("|");
      
          const cachedResult = await redisUtils.get(key);
          if (cachedResult) {
            logger.debug(`${logPrefix} :: Cached result found`);
            // return JSON.parse(cachedResult);
          }
      
          logger.info(`${logPrefix} :: Fetching roles from DB`);
          const roles = await rolesRepository.listRoles(
            isActive,
            pageSize,
            currentPage,
            searchFilter
            
          );
      
          if (roles?.length > 0) {
            await redisUtils.set(key, JSON.stringify(roles), CacheTTL.MID);
          }
      
          return roles || [];
            } catch (error: unknown) {
        if (isError(error)) {
          logger.error(`${logPrefix} :: Error :: ${error.message}`);
          throw new Error(error.message);
        }
        return []; 
      }
    },
      
      listRolesCount: async (
        isActive: boolean,
        searchFilter: string
      ): Promise<number> => {
        const logPrefix = `rolesService :: listRolesCount`;
        try {
          const keyParts = [
            RedisKeys.ROLES_COUNT,
            `active:${isActive}`
          ];
      
          if (searchFilter) keyParts.push(`search:${searchFilter}`);
      
          const key = keyParts.join("|");
      
          const cachedResult = await redisUtils.get(key);
          if (cachedResult) {
            logger.debug(`${logPrefix} :: Cached count found`);
            return parseInt(cachedResult, 10);
          }
      
          logger.info(`${logPrefix} :: Counting roles from DB`);
          const count = await rolesRepository.listRolesCount(searchFilter,isActive );
      
          await redisUtils.set(key, count.toString(), CacheTTL.MID);
      
          return count;
           } catch (error: unknown) {
          if (isError(error)) {
            logger.error(`${logPrefix} :: Error :: ${error.message}`);
            throw new Error(error.message);
          }
          
          return 0;
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
                // redisUtils.set(key, JSON.stringify(result), CacheTTL.LONG);
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
                // redisUtils.set(key, JSON.stringify(result), CacheTTL.MID);
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
                // redisUtils.set(key, JSON.stringify(result), CacheTTL.MID);
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