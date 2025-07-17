import { RedisKeys } from "../../enums/redisKeys";
import { redisKeysFormatter } from "../../helpers";
import { CacheTTL, LoggerUtils, RedisUtils  } from "../../triance-commons";
import { IRole } from "../../types/custom";
import rolesRepository from "../repositories/rolesRepository";
import { RoleStatus } from "../../enums/status";

const logger = LoggerUtils.getLogger("teacherController");
const redisUtils = RedisUtils.getInstance();
function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const rolesService = {
    getDefaultAccessList: async (): Promise<any> => {
        const logPrefix = ` rolesService :: getDefaultAccessList`;
        try {
          const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.DEFAULT_ACCESS_LIST, {});
          const cachedResult = await redisUtils.get(key);
          if (cachedResult) {
            logger.debug(`${logPrefix} :: Cached result found :: ${cachedResult}`);
            return JSON.parse(cachedResult)
          }
    
          const result = await rolesRepository.getDefaultAccessList();
          logger.debug(`${logPrefix} :: Data fetched from repository :: ${JSON.stringify(result)}`);
          if (result && result.length > 0) redisUtils.set(key, JSON.stringify(result), CacheTTL.LONG);
          return result;
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
      getCombinedAccess: async (roleId: string): Promise<any> => {
        const logPrefix = ` rolesService :: getCombinedAccess :: roleId :: ${roleId}`;
        try {
          const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.COMBINED_ACCESS_BY_ROLE_ID, { roleId: roleId.toString() });
          const cachedResult = await redisUtils.get(key);
          if (cachedResult) {
            const parsed = typeof cachedResult === 'string' ? JSON.parse(cachedResult) : cachedResult;
            logger.debug(`${logPrefix} :: parsed cached result ::`, parsed);
            return parsed;
          }
    
          const result = await rolesRepository.getCombinedAccess(roleId);
          if (result && result.length > 0) redisUtils.set(key, JSON.stringify(result), CacheTTL.LONG);
          return result;
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
    
      addRole: async (role: IRole) => {
        const logPrefix = `rolesService :: addRole :: role :: ${JSON.stringify(role)}`;
        try {
          const createRoleId = await rolesRepository.addRole(role);
    
          if (role.permissions && role.permissions.length > 0) {
            for (const permission of role.permissions) {
              await rolesRepository.addPermissions(
                createRoleId,
                permission.menuId,
                permission.permissionId,
                permission.updatedBy ,
             
              );
            }
          }
          await rolesService.clearRedisCache(createRoleId);
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
      updateRole: async (role: IRole) => {
        const logPrefix = `rolesService :: updateRole :: role :: ${JSON.stringify(role)}`;
        try {
          await rolesRepository.updateRole(role);
    
          if (role.permissions && role.permissions.length > 0) {
            for (const permission of role.permissions) {
              await rolesRepository.addPermissions(
                role.role_id,
                permission.menuId,
                permission.permissionId,
                role.updated_by
              );
            }
          }
          await rolesService.clearRedisCache(role.role_id);
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
      listRoles: async (
        isActive: boolean,
        pageSize: number,
        currentPage: number,
        roleId: string,
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
            return JSON.parse(cachedResult);
          }
      
          logger.info(`${logPrefix} :: Fetching roles from DB`);
          const roles = await rolesRepository.listRoles(
            isActive,
            pageSize,
            currentPage,
            roleId,
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
        roleId: string,
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
          const count = await rolesRepository.listRolesCount(isActive, roleId, searchFilter);
      
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
      getAccessListByRoleId: async (roleId: string): Promise<any> => {
        const logPrefix = `rolesService :: getAccessListByRoleId :: roleId :: ${roleId}`;
        try {
          const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ACCESS_LIST_BY_ROLE_ID, { roleId: roleId.toString() });
          const cachedResult = await redisUtils.get(key);
          if (cachedResult) {
            logger.debug(`${logPrefix} :: cached result :: ${cachedResult}`)
            return JSON.parse(cachedResult)
          }
    
          const result = await rolesRepository.getAccessListByRoleId(roleId);
          if (result) redisUtils.set(key, result, CacheTTL.LONG);
          return result;
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      }, updateRoleStatus: async (roleId: string, status: RoleStatus): Promise<void> => {
        const logPrefix = ` rolesService :: updateRoleStatus :: roleId :: ${roleId}`;
        try {
          logger.info(`${logPrefix} :: Updating role status`);
          await rolesRepository.updateRoleStatus(roleId, status);
          await rolesService.clearRedisCache(roleId);
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
      getRoleById: async (roleId: string): Promise<IRole | null> => {
        const logPrefix = `rolesService :: getRoleById :: roleId :: ${roleId}`;
        try {
          const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLE_BY_ID, { roleId });
          const cachedResult = await redisUtils.get(key);
      
          if (cachedResult) {
            logger.debug(`${logPrefix} :: Cached result found`);
            return JSON.parse(cachedResult);
          }
      
          const role = await rolesRepository.getRoleById(roleId);
      
          if (role) {
            await redisUtils.set(key, JSON.stringify(role), CacheTTL.LONG);
          }
      
          return role;
            } catch (error: unknown) {
        if (isError(error)) {
          logger.error(`${logPrefix} :: Error :: ${error.message}`);
          throw new Error(error.message);
        }
        return null;
      }
    },
      clearRedisCache: async (roleId?: string, pageSize: number = 10,currentPage: number = 1, searchFilter?: string, isActive: boolean = true): Promise<void> => {
        const logPrefix = `rolesService :: clearRedisCache :: roleId :: ${roleId}`;
        try {
          const keysToDelete: string[] = [
            redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLES_LIST, { pageSize: pageSize.toString() }),
            RedisKeys.DEFAULT_ACCESS_LIST,
            `${RedisKeys.ROLES_COUNT}|active:${isActive}`,
            `${RedisKeys.ACTIVE_ROLES}|count|active:${isActive}`,
            `${RedisKeys.ACTIVE_ROLES}|limit:${pageSize}`,
            `${RedisKeys.ROLES}|limit:${pageSize}|active:${isActive}`
          ];

          if (searchFilter) {
            keysToDelete.push(`${RedisKeys.ROLES_LIST}|search:${searchFilter}|limit:${pageSize}`);
            keysToDelete.push(`${RedisKeys.ROLES_COUNT}|search:${searchFilter}|active:${isActive}`);
          }
      
          if (roleId) {
            keysToDelete.push(
              redisKeysFormatter.getFormattedRedisKey(RedisKeys.ROLE_BY_ID, { roleId }),
              redisKeysFormatter.getFormattedRedisKey(RedisKeys.ACCESS_LIST_BY_ROLE_ID, { roleId }),
              redisKeysFormatter.getFormattedRedisKey(RedisKeys.COMBINED_ACCESS_BY_ROLE_ID, { roleId })
            );
          }
      
          for (const key of keysToDelete) {
            logger.debug(`${logPrefix} :: Attempting to delete key :: ${key}`);
            await redisUtils.delete(key);
          }
      
          logger.info(`${logPrefix} :: Cache keys cleared successfully`);
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
      },
      getMenusList: async (isActive: boolean): Promise<any[]> => {
    const logPrefix = `menusRepository :: getMenusList :: isActive :: ${isActive}`;
    try {
      logger.info(`${logPrefix} :: Fetching menu list`);

      const query = `
        SELECT 
          menu_id AS "menuId",
          menu_name AS "menuName",
          route_url AS "routeUrl",
          icon_class AS "iconClass",
          status,
          true AS "initiallyOpened"
        FROM menus
        ${isActive ? "WHERE status = 1" : ""}
        ORDER BY menu_order ASC;
      `;

      const { rows } = await db.query(query);
      logger.debug(`${logPrefix} :: menus :: ${JSON.stringify(rows)}`);

      return rows;
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message}`);
      throw error;
    }
  },

  
    };
    
    export default rolesService;