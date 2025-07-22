import { RedisKeys } from "../../enums";
import { redisKeysFormatter } from "../../helpers";
import { IMenu } from "../../types/custom";
import { menusRepository } from "../repositories";
import { CacheTTL, LoggerUtils, RedisUtils  } from "../../triance-commons";

const logger = LoggerUtils.getLogger("teacherController");
const redisUtils = RedisUtils.getInstance();
function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const menusServices={
    createMenu: async (menu: IMenu) => {
        const logPrefix = `menusServices :: createMenu :: ${JSON.stringify(menu)}`;
        try {
            await menusRepository.createMenu(menu);
            await menusServices.clearRedisCache();
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },

    updateMenu: async (menu: IMenu) => {
        const logPrefix = `menusServices :: updateMenu :: ${JSON.stringify(menu)}`;
        try {
            await menusRepository.updateMenu(menu);
            await menusServices.clearRedisCache((menu.menu_id));
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },

    getMenuById: async (menu_id: number): Promise<IMenu | undefined> => {
        const logPrefix = `menusServices :: getMenuById :: menuId :: ${menu_id}`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.MENU_BY_ID, { menu_id: menu_id.toString() });
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(
                    `${logPrefix} :: returned from cachedResult :: ${cacheResult}`
                  );
                return JSON.parse(cacheResult);
            }

            const menu = await menusRepository.getMenuById(menu_id);
            logger.debug(
                `${logPrefix} :: returned from DB :: ${menu}`
              );
            if (menu) {
                redisUtils.set(key, JSON.stringify(menu), CacheTTL.LONG);
                return menu;
            }
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },

    listMenus: async (): Promise<IMenu[] | undefined> => {
        const logPrefix = `menusServices :: listMenus`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.MENUS, {});
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(
                    `${logPrefix} :: returned from cachedResult :: ${cacheResult}`
                  );
                return JSON.parse(cacheResult);
            }

            const menus = await menusRepository.listMenus();
            logger.debug(
                `${logPrefix} :: returned from DB :: ${menus}`
              );
            if (menus && menus.length > 0) {
                redisUtils.set(key, JSON.stringify(menus), CacheTTL.LONG);
                return menus;
            }
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
    updateMenuStatus: async (menu_id: number, status: number) => {
        const logPrefix = `menusServices :: updateMenuStatus :: menuId :: ${menu_id} :: status :: ${status}`;
        try {
            await menusRepository.updateMenuStatus(menu_id, status);
            await menusServices.clearRedisCache(menu_id);
        } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
    clearRedisCache: async (menu_id?: number) => {
        const logPrefix = `menusServices :: clearRedisCache :: menuId :: ${menu_id}`;
        try{
            if(menu_id) await redisUtils.delete(redisKeysFormatter.getFormattedRedisKey(RedisKeys.MENU_BY_ID, { menu_id: menu_id.toString() }));
            await redisUtils.delete(redisKeysFormatter.getFormattedRedisKey(RedisKeys.MENUS, {}));
        }
        catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    }
}

export default menusServices;