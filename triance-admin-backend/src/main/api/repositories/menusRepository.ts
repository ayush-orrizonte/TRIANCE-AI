import { LoggerUtils } from "../../triance-commons";
import { pgQueries } from "../../enums";
import { IMenu } from "../../types/custom";
import { MenuStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg"; 

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("menusController");

interface QueryResult {
    rows: any[];
    rowCount?: number;
}

const menusRepository = {
    createMenu: async (menu: IMenu): Promise<void> => {
        const logPrefix = `menusRepository :: createMenu :: menu :: ${JSON.stringify(menu)}`;
        try {
            const result = await pgClient.executeQuery<IMenu>(
                pgQueries.MenuQueries.ADD_MENU,
                [menu.menu_name, menu.menu_description, menu.status, 
                 menu.menu_order, menu.route_url, menu.icon_class]
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
  
    existsByMenuName: async (menuName: string, menuId?: number): Promise<boolean> => {
    const logPrefix = `menusRepository :: existsByMenuName :: menuName :: ${menuName} :: menuId :: ${menuId}`;
    try {
        let query = `${pgQueries.MenuQueries.EXISTS_BY_MENU_NAME}`;
        const values: (string | number)[] = [menuName];
        
        if (menuId !== undefined) {
            query = query.replace("status <> 2", `status <> 2 AND menu_id <> $${values.length + 1}`);
            values.push(menuId);
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
    existsByMenuId: async (menuId: number): Promise<boolean> => {
        const logPrefix = `menusRepository :: existsByMenuId :: menuId :: ${menuId}`;
        try {
            const result = await pgClient.executeQuery<{exists: boolean}>(
                pgQueries.MenuQueries.EXISTS_BY_MENU_ID,
                [menuId]
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

    updateMenu: async (menu: IMenu): Promise<void> => {
        const logPrefix = `menusRepository :: updateMenu :: menu :: ${JSON.stringify(menu)}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.MenuQueries.UPDATE_MENU,
                [menu.menu_id, menu.menu_name, menu.menu_description, 
                 menu.status, menu.menu_order, menu.route_url, menu.icon_class]
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

    listMenus: async (): Promise<IMenu[]> => {
        const logPrefix = `menusRepository :: listMenus`;
        try {
            const result = await pgClient.executeQuery<IMenu>(pgQueries.MenuQueries.LIST_MENUS);
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
   
    getMenuById: async (menuId: number): Promise<IMenu | null> => {
        const logPrefix = `menusRepository :: getMenuById :: menuId :: ${menuId}`;
        try {
            const result = await pgClient.executeQuery<IMenu>(
                pgQueries.MenuQueries.GET_MENU_BY_ID,
                [menuId]
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
    
    updateMenuStatus: async (menuId: number, status: MenuStatus): Promise<void> => {
        const logPrefix = `menusRepository :: updateMenuStatus :: menuId :: ${menuId} :: status :: ${status}`;
        try {
            const result = await pgClient.executeQuery(
                pgQueries.MenuQueries.UPDATE_MENU_STATUS,
                [menuId, status]
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
    getMenusList: async (isActive?: boolean): Promise<IMenu[]> => {
    const logPrefix = `menusRepository :: getMenusList :: isActive :: ${isActive}`;
    try {
        let query = pgQueries.MenuQueries.LIST_MENUS as string; 
        const values: any[] = [];

        if (isActive !== undefined) {
            query = query.includes('WHERE') 
                ? query.replace('WHERE', `WHERE status = $${values.length + 1} AND`)
                : query + ' WHERE status = $1';
            values.push(isActive ? MenuStatus.ACTIVE : MenuStatus.INACTIVE);
        }

        logger.debug(`${logPrefix} :: query :: ${query} :: values :: ${JSON.stringify(values)}`);
        const result = await pgClient.executeQuery<IMenu>(query, values);
        return result;
    } catch (error) {
        logger.error(`${logPrefix} :: Error :: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
},
};

export default menusRepository;