import { Request, Response } from "express";
import { LoggerUtils, HttpStatusCodes } from "../../triance-commons"; 
import menusRepository from "../repositories/menusRepository";
import menusServices from "../services/menusService";
import { ErrorCodes } from "../../enums"; 
import menusValidations from "../validations/menusValidations";
import { IMenu } from "../../types/custom"; 
import { v4 as uuidv4 } from "uuid";

const logger = LoggerUtils.getLogger("menusController");

const menusController = {
  createMenu: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `createMenu`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Menus']
        #swagger.summary = 'Create Menu'
        #swagger.description = 'Endpoint to create a new Menu'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            menu_name: 'Categories',
            menu_description: 'Menu to manage categories',
            menu_order: 1,
            route_url: '/categories',
            icon_class: 'fa fa-menu'
          }
        }
      */

      const menuData: IMenu = {
        ...req.body
      };

      logger.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(menuData)}`);

      const { error } = menusValidations.validateCreateMenu(menuData);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.menus.MENUS000.errorCode,
          errorMessage,
        });
        return;
      }

      const menuExists = await menusRepository.existsByMenuName(menuData.menu_name, menuData.menu_id);
      if (menuExists) {
        logger.warn(`${logPrefix} :: Menu name already exists`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.menus.MENUS005);
        return;
      }

      await menusServices.createMenu(menuData);

      logger.info(`${logPrefix} :: Menu created successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Menu Created Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.menus.MENUS000);
    }
  },

  updateMenu: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `updateMenu`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Menus']
        #swagger.summary = 'Update Menu'
        #swagger.description = 'Endpoint to update an existing Menu'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
          menu_id: 1,
            menu_name: 'Categories',
            menu_description: 'Menu to manage categories',
            menu_order: 1,
            route_url: '/categories',
            icon_class: 'fa fa-menu'
          }
        }
      */

      const menu: IMenu = {
        ...req.body
      };

      logger.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(menu)}`);

      const { error } = menusValidations.validateUpdateMenu(menu);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.menus.MENUS000.errorCode,
          errorMessage,
        });
        return;
      }

      const menuExistsById = await menusRepository.existsByMenuId(menu.menu_id);
      if (!menuExistsById) {
        logger.warn(`${logPrefix} :: Menu not found with ID ${menu.menu_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.menus.MENUS001);
        return;
      }

      const menuNameExists = await menusRepository.existsByMenuName(menu.menu_name, menu.menu_id);
      if (menuNameExists) {
        logger.warn(`${logPrefix} :: Menu name already exists`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.menus.MENUS005);
        return;
      }

      await menusServices.updateMenu(menu);

      logger.info(`${logPrefix} :: Menu updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Menu Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.menus.MENUS000);
    }
  },

  getMenus: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getMenus`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Menus']
        #swagger.summary = 'List Menus'
        #swagger.description = 'Endpoint to retrieve Menus List'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const isActive = (req.query.isActive as string) === "1";
      const menusList = await menusRepository.getMenusList(isActive);

      logger.info(`${logPrefix} :: Menus fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: menusList,
        message: "Menus Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.menus.MENUS000);
    }
  },

  getMenu: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getMenu`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Menus']
        #swagger.summary = 'Get Menu By ID'
        #swagger.description = 'Endpoint to retrieve a Menu by ID'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const menu_id = req.query.menu_id;

      if (!menu_id) {
        logger.warn(`${logPrefix} :: Missing menu_id in request params`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "MENUS002",
          message: "menu_id is required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: menu_id :: ${menu_id}`);

      const menuIdNumber = Number(menu_id);
      if (isNaN(menuIdNumber)) {
        logger.warn(`${logPrefix} :: Invalid menu_id format ${menu_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "MENUS003",
          message: "menu_id must be a valid number",
        });
        return;
      }

      const menuExists = await menusRepository.existsByMenuId(menuIdNumber);
      if (!menuExists) {
        logger.warn(`${logPrefix} :: Menu not found with ID ${menu_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.menus.MENUS001);
        return;
      }

      const menu = await menusServices.getMenuById(menuIdNumber);

      logger.info(`${logPrefix} :: Menu fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: menu,
        message: "Menu Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.menus.MENUS000);
    }
  },

  updateMenuStatus: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `updateMenuStatus`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Menus']
        #swagger.summary = 'Update Menu Status'
        #swagger.description = 'Endpoint to update Menu status'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            menuId: 1,
            status: 1
          }
        }
      */

      const { menuId, status } = req.body;

      if (!menuId || status === undefined) {
        logger.warn(`${logPrefix} :: Missing menuId or status`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "MENUS002",
          message: "menuId and status are required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: menuId :: ${menuId} :: status :: ${status}`);

      const { error } = menusValidations.validateUpdateMenuStatus(req.body);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.menus.MENUS000.errorCode,
          errorMessage,
        });
        return;
      }

      const menuExists = await menusRepository.existsByMenuId(menuId);
      if (!menuExists) {
        logger.warn(`${logPrefix} :: Menu not found with ID ${menuId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.menus.MENUS001);
        return;
      }

      await menusServices.updateMenuStatus(menuId, status);

      logger.info(`${logPrefix} :: Menu status updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Menu Status Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.menus.MENUS000);
    }
  },
};

export default menusController;