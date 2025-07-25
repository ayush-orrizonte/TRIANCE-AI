import { Response } from "express";
import { Request } from "../../types/express";
import { LoggerUtils, HttpStatusCodes } from "../../triance-commons";
import { ErrorCodes } from "../../enums";
import { IRole } from "../../types/custom";
import rolesValidations from "../validations/rolesValidations";
import rolesService from "../services/rolesService";
import rolesRepository from "../repositories/rolesRepository";
import { Levels } from "../../enums/status";

const logger = LoggerUtils.getLogger("rolesController");

const rolesController = {
  listRoles: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `listRoles`;
    try {
      logger.info(`${logPrefix} :: Request received`);

      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'List Roles'
        #swagger.description = 'Endpoint to retrieve Roles List'
        #swagger.parameters['Authorization'] = {
            in: 'header',
            required: true,
            type: "string",
            description: "JWT token for authentication"
        }
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                isActive: true,
                pageSize: 50,
                currentPage: 1,
                searchFilter: "Admin"
            }
        }
      */

      const plainToken = req.plainToken;
      const roleId = plainToken?.role_id;

      let {
        isActive ,
        pageSize = 10,
        currentPage = 1,
        searchFilter = "",
      } = req.body;

      pageSize = Number(pageSize);
      currentPage = Number(currentPage)

      logger.debug(
        `${logPrefix} :: Parsed parameters :: roleId: ${roleId}, isActive: ${isActive}, pageSize: ${pageSize}, currentPage: ${currentPage}, searchFilter: '${searchFilter}'`
      );

      const rolesList = await rolesService.listRoles(
        isActive,
        pageSize,
        currentPage,
        searchFilter
      );

      const rolesCount = await rolesService.listRolesCount(
        isActive,
        searchFilter
      );

      logger.info(`${logPrefix} :: Roles fetched successfully`);

      res.status(HttpStatusCodes.OK).send({
        data: {
          rolesList,
          rolesCount,
        },
        message: "Roles Fetched Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },

  updateRoleStatus: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateRoleStatus";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Update Role Status'
        #swagger.description = 'Endpoint to update Role Status'
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
            role_id: 2,
            status: 1
          }
        }
      */

      const { role_id, status } = req.body;
      logger.debug(`${logPrefix} :: Parameters - role_id: ${role_id}, status: ${status}`);

      const roleExists = await rolesRepository.existsByRoleId(role_id);
      if (!roleExists) {
        logger.warn(`${logPrefix} :: Role not found with ID ${role_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
        return;
      }

      await rolesService.updateRoleStatus(
        role_id,
        status,
        Number(req.query.id)
      );

      logger.info(`${logPrefix} :: Role status updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Role Status Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  addRole: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "addRole";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Add Role'
        #swagger.description = 'Endpoint to create Role'
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
            role_name: 'Department Head',
            role_description: 'Head of the Department',
            level: 'Admin',
            permissions: [
              {
                menu_id: 1,
                permission_id: 2
              }
            ]
          }
        }
      */
      const roleData: IRole = req.body;
      const plainToken = req.plainToken;
      logger.debug(`${logPrefix} :: Request data :: ${JSON.stringify(roleData)}`);

      const { error } = rolesValidations.validateCreateRole(roleData);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.roles.ROLE00000.errorCode,
          errorMessage,
        });
        return;
      }

      const roleExistsByName = await rolesRepository.existsByRoleName(
        roleData.role_name,
        undefined
      );
      if (roleExistsByName) {
        logger.warn(`${logPrefix} :: Role name already exists`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00007);
        return;
      }

      roleData.created_by = 1 ;
      roleData.updated_by = 1;

      await rolesService.addRole(roleData);

      logger.info(`${logPrefix} :: Role added successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Role Added Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  updateRole: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateRole";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Update Role'
        #swagger.description = 'Endpoint to update Role'
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
            role_id: 2,
            role_name: 'Department Head',
            role_description: 'Head of the Department',
            level: 'Admin',
            status: 1,
            permissions: [
              {
                menu_id: 1,
                permission_id: 2
              }
            ]
          }
        }
      */
      const roleData: IRole = req.body;
      logger.debug(`${logPrefix} :: Request data :: ${JSON.stringify(roleData)}`);

      const { error } = rolesValidations.validateUpdateRole(roleData);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.roles.ROLE00000.errorCode,
          errorMessage,
        });
        return;
      }

      const roleExistsById = await rolesRepository.existsByRoleId(roleData.role_id);
      if (!roleExistsById) {
        logger.warn(`${logPrefix} :: Role not found with ID ${roleData.role_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
        return;
      }

      const roleExistsByName = await rolesRepository.existsByRoleName(
        roleData.role_name,
        roleData.role_id
      );
      if (roleExistsByName) {
        logger.warn(`${logPrefix} :: Role name already exists`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00007);
        return;
      }

      roleData.updated_by = 1;

      await rolesService.updateRole(roleData);

      logger.info(`${logPrefix} :: Role updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Role Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  getMenusList: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getMenusList";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Menu List'
        #swagger.description = 'Endpoint to retrieve Menu List'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['isActive'] = {
          in: 'query',
          required: false,
          type: 1,
          description: 'Filter by active status'
        }
      */

      const isActive = req.query.isActive == 1 ? true : false;
      logger.debug(`${logPrefix} :: isActive: ${isActive}`);

      const menusList = await rolesRepository.getMenusList(isActive);

      logger.info(`${logPrefix} :: Menus list fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: menusList,
        message: "Menus List Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  getDefaultAccessList: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getDefaultAccessList";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Default Access List'
        #swagger.description = 'Endpoint to retrieve Default Access List'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const defaultAccessList = await rolesService.getDefaultAccessList();

      logger.info(`${logPrefix} :: Default access list fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: defaultAccessList,
        message: "Default Access List Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  getCombinedAccess: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getCombinedAccess";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Combined Access'
        #swagger.description = 'Endpoint to retrieve Combined Access'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */
      const roleId = req.query.role_id;
      logger.debug(`${logPrefix} :: roleId: ${roleId}`);

      const combinedAccess = await rolesService.getCombinedAccess(roleId);

      logger.info(`${logPrefix} :: Combined access fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: combinedAccess,
        message: "Combined Access Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  listLevels: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "listLevels";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'List Levels'
        #swagger.description = 'Endpoint to List Levels'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const levels = Object.values(Levels).filter(
        (value) => typeof value === "string" && value !== Levels.ADMIN
      );

      logger.info(`${logPrefix} :: Levels listed successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: levels,
        message: "Levels Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  getAccessListByRoleId: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getAccessListByRoleId";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Access List By Role Id'
        #swagger.description = 'Endpoint to retrieve Access List with Role Id'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['roleId'] = {
          in: 'path',
          required: true,
          type: 'number',
          description: 'ID of the role'
        }
      */

      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        logger.warn(`${logPrefix} :: Invalid roleId format`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00003);
        return;
      }

      logger.debug(`${logPrefix} :: roleId: ${roleId}`);

      const roleExists = await rolesRepository.existsByRoleId(roleId);
      if (!roleExists) {
        logger.warn(`${logPrefix} :: Role not found with ID ${roleId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
        return;
      }

      const accessList = await rolesService.getAccessListByRoleId(roleId);

      logger.info(`${logPrefix} :: Access list fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: accessList,
        message: "Access List Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  getRoleById: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getRoleById";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Role'
        #swagger.description = 'Endpoint to retrieve Role Information'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['roleId'] = {
          in: 'path',
          required: true,
          type: 'number',
          description: 'ID of the role'
        }
      */

      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        logger.warn(`${logPrefix} :: Invalid roleId format`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00003);
        return;
      }

      logger.debug(`${logPrefix} :: roleId: ${roleId}`);

      const roleExists = await rolesRepository.existsByRoleId(roleId);
      if (!roleExists) {
        logger.warn(`${logPrefix} :: Role not found with ID ${roleId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
        return;
      }

      const role = await rolesRepository.getRoleById(roleId);

      logger.info(`${logPrefix} :: Role fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: role,
        message: "Role Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
    }
  },

  health: (req: Request, res: Response): void => {
    /*
      #swagger.tags = ['Roles']
      #swagger.summary = 'Health Check API'
      #swagger.description = 'Endpoint to health check Roles Service'
    */
    res.status(HttpStatusCodes.OK).send({
      data: null,
      message: "Roles Service is Up and Running!",
    });
  },
};

export default rolesController;