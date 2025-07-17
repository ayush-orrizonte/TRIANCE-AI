import { LoggerUtils } from "../../triance-commons";
import { pgQueries } from "../../enums";
import { IRole } from "../../types/custom";
import { RoleStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg";

const logger = LoggerUtils.getLogger("rolesRepository");

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

const rolesRepository = {
  existsByRoleName: async (roleName: string, roleId?: string): Promise<boolean> => {
    const logPrefix = `rolesRepository :: existsByRoleName :: roleName :: ${roleName}`;
    try {
      const query = pgQueries.RoleQueries.EXISTS_BY_ROLE_NAME;
      const values = roleId ? [roleName, roleId] : [roleName];
      const result = await pgClient.executeQuery<{ exists: boolean }>(query, values);
      return result.length > 0 ? result[0].exists : false;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  existsByRoleId: async (roleId: string): Promise<boolean> => {
    const logPrefix = `rolesRepository :: existsByRoleId :: roleId :: ${roleId}`;
    try {
      const result = await pgClient.executeQuery<{ exists: boolean }>(
        pgQueries.RoleQueries.EXISTS_BY_ROLE_ID,
        [roleId]
      );
      return result.length > 0 ? result[0].exists : false;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  addRole: async (role: IRole): Promise<string> => {
    const logPrefix = `rolesRepository :: addRole`;
    try {
      const result = await pgClient.executeQuery<{ role_id: string }>(
        pgQueries.RoleQueries.ADD_ROLE,
        [
          role.role_name,
          role.role_description,
          role.status,
          role.created_by,
          role.updated_by,
          JSON.stringify(role.permissions || [])
        ]
      );
      return result[0]?.role_id;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  updateRole: async (role: IRole): Promise<void> => {
    const logPrefix = `rolesRepository :: updateRole :: roleId :: ${role.role_id}`;
    try {
      await pgClient.executeQuery(
        pgQueries.RoleQueries.UPDATE_ROLE,
        [
          role.role_id,
          role.role_name,
          role.role_description,
          role.status,
          role.updated_by,
          JSON.stringify(role.permissions || [])
        ]
      );
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  updateRoleStatus: async (roleId: string, status: RoleStatus): Promise<void> => {
    const logPrefix = `rolesRepository :: updateRoleStatus :: roleId :: ${roleId}`;
    try {
      await pgClient.executeQuery(
        pgQueries.RoleQueries.UPDATE_ROLE_STATUS,
        [roleId, status]
      );
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  getRoleById: async (roleId: string): Promise<IRole | null> => {
    const logPrefix = `rolesRepository :: getRoleById :: roleId :: ${roleId}`;
    try {
      const result = await pgClient.executeQuery<IRole>(
        pgQueries.RoleQueries.GET_ROLE_BY_ID,
        [roleId]
      );
      return result.length ? result[0] : null;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
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
      const result = await pgClient.executeQuery<IRole>(
        pgQueries.RoleQueries.LIST_ROLES,
        [isActive ? RoleStatus.ACTIVE : RoleStatus.INACTIVE, pageSize, (currentPage - 1) * pageSize, `%${searchFilter}%`]
      );
      return result;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  listRolesCount: async (searchFilter: string): Promise<number> => {
    const logPrefix = `rolesRepository :: listRolesCount`;
    try {
      const result = await pgClient.executeQuery<{ count: number }>(
        pgQueries.RoleQueries.LIST_ROLES_COUNT,
        [`%${searchFilter}%`]
      );
      return result[0]?.count || 0;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  getAccessListByRoleId: async (roleId: string): Promise<any[]> => {
    const logPrefix = `rolesRepository :: getAccessListByRoleId :: roleId :: ${roleId}`;
    try {
      const result = await pgClient.executeQuery<any>(
        pgQueries.RoleQueries.GET_ACCESS_LIST_BY_ROLE_ID,
        [roleId]
      );
      return result;
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
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

      const params = isActive ? [1] : [];

    const rows = await pgClient.executeQuery(query, params);
    logger.debug(`${logPrefix} :: menus :: ${JSON.stringify(rows)}`);

    return rows;
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message}`);
      throw error;
    }
  },

  getDefaultAccessList: async (): Promise<any> => {
    const logPrefix = `menusRepository :: getDefaultAccessList`;
    try {
      logger.info(`${logPrefix} :: Fetching default access list`);

      const query = `
        SELECT 
          menu_id AS "menuId",
          menu_name AS "menuName",
          route_url AS "routeUrl",
          icon_class AS "iconClass"
        FROM menus
        WHERE status = 1
        ORDER BY menu_order ASC;
      `;

      const { rows: menus } = await db.query(query);

      const defaultPermissions = [
        { permissionId: 1, permissionName: "Write" },
        { permissionId: 2, permissionName: "Read" },
      ];

      const result = menus.flatMap((menu) =>
        defaultPermissions.map((permission) => ({
          menu_id: menu.menuId,
          menu_name: menu.menuName,
          route_url: menu.routeUrl,
          icon_class: menu.iconClass,
          permission_id: permission.permissionId,
          permission_name: permission.permissionName,
        }))
      );

      logger.debug(`${logPrefix} :: Result :: ${JSON.stringify(result)}`);
      return { data: result };
    } catch (error: any) {
      logger.error(`${logPrefix} :: Error :: ${error.message}`);
      throw new Error(error.message);
    }
  },

  getCombinedAccess: async (roleId: string): Promise<any[]> => {
    const logPrefix = `menusRepository :: getCombinedAccess :: roleId :: ${roleId}`;
    try {
      logger.info(`${logPrefix} :: Fetching combined access for role`);

      const roleQuery = `
        SELECT permissions 
        FROM roles 
        WHERE role_id = $1 AND status = 1;
      `;
      const { rows: roleRows } = await db.query(roleQuery, [roleId]);
      const role = roleRows[0];

      if (!role || !role.permissions || role.permissions.length === 0) {
        logger.warn(`${logPrefix} :: No permissions found for role`);
        return [];
      }

      const permissionMap: Record<string, string> = {
        "1": "Write",
        "2": "Read",
      };

      const menuIds = role.permissions.map((p: any) => p.menuId).filter(Boolean);
      const uniqueMenuIds = [...new Set(menuIds)];

      const menuQuery = `
        SELECT 
          menu_id AS "menuId",
          menu_name AS "menuName",
          route_url AS "routeUrl",
          icon_class AS "iconClass"
        FROM menus
        WHERE menu_id = ANY($1::uuid[]) AND status = 1;
      `;

      const { rows: menus } = await db.query(menuQuery, [uniqueMenuIds]);

      const combinedAccessRaw = role.permissions.map((perm: any) => {
        const menu = menus.find((m) => m.menuId === perm.menuId);
        if (!menu) return null;

        return {
          menu_name: menu.menuName,
          route_url: menu.routeUrl,
          icon_class: menu.iconClass,
          access: permissionMap[String(perm.permissionId)] || "Unknown",
        };
      }).filter(Boolean);

      const seen = new Set();
      const combinedAccess = combinedAccessRaw.filter((item) => {
        const key = `${item.menu_name}-${item.route_url}-${item.icon_class}-${item.access}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      logger.debug(`${logPrefix} :: Combined access result :: ${JSON.stringify(combinedAccess)}`);
      return combinedAccess;
    } catch (error: any) {
      logger.error(`${logPrefix} :: Error :: ${error.message}`);
      throw new Error(error.message);
    }
  },
};

export default rolesRepository;
