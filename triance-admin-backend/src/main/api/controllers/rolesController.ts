import { Response } from "express";
import { LoggerUtils, HttpStatusCodes } from "../../triance-commons";
import { Request } from "../../types/express";
import rolesService from "../services/rolesService";
import rolesRepository from "../repositories/rolesRepository";
import { ErrorCodes } from "../../enums";
import { Levels } from "../../enums/status";
import rolesValidations from "../validations/rolesValidations";
import { IRole } from "../../types/custom";
import { v4 as uuidv4 } from "uuid";

const logger = LoggerUtils.getLogger("rolesController");

const rolesController = {
  getMenusList: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getMenusList `;
    try {
      logger.info(` ${logPrefix} :: Request received`);
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
        */
      const isActive = (req.query.isActive as string) === "1";
      const menusList = await rolesRepository.getMenusList(isActive);

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
    const logPrefix = ` getDefaultAccessList`;
    try {
      logger.info(` ${logPrefix} :: Request received`);
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

      res.status(HttpStatusCodes.OK).send({
        data: defaultAccessList,
        message: "Default Access List Fetched Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },

  listLevels: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = ` listLevels`;
    try {
      logger.info(` ${logPrefix} :: Request received`);
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
        (val) => typeof val === "string" && val !== Levels.USER
      );

      res.status(HttpStatusCodes.OK).send({
        data: levels,
        message: "Levels Fetched Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },

  getCombinedAccess: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = ` getCombinedAccess`;
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

      const roleId = req.plainToken?.roleId;
      if (!roleId) {
        logger.warn(` ${logPrefix} :: Missing roleId from token`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ROLE001",
          message: "Role ID is missing from token",
        });
        return;
      }

      const combinedAccess = await rolesService.getCombinedAccess(roleId);

      res.status(HttpStatusCodes.OK).send({
        data: combinedAccess,
        message: "Combined Access Fetched Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },
  addRole: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = ` addRole`;
    try {
      logger.info(`${logPrefix} :: Request received`);

      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Add Role'
        #swagger.description = 'Endpoint to create a new Role'
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
            roleName: 'Department Head',
            roleDescription: 'Head of the Department',
            permissions: [
              {
                menuId: "1",
                permissionId: "2"
              }
            ]
          }
        }
      */

      const plainToken = req.plainToken;
      const roleData = {
        ...req.body,
        roleId: uuidv4(),
        createdBy: plainToken?.id,
        updatedBy: plainToken?.id,
      };

      logger.debug(
        `${logPrefix} :: Parsed parameters :: ${JSON.stringify(roleData)}`
      );

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

      const roleExists = await rolesRepository.existsByRoleName(
        roleData.roleName,
        roleData.roleId
      );
      if (roleExists) {
        logger.warn(`${logPrefix} :: Role already exists`);
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(ErrorCodes.roles.ROLE00007);
        return;
      }

      await rolesService.addRole(roleData);

      logger.info(`${logPrefix} :: Role added successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Role Added Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(ErrorCodes.roles.ROLE00000);
    }
  },
  updateRole: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `updateRole`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Update Role'
        #swagger.description = 'Endpoint to update an existing Role'
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
            roleId: "2",
            roleName: 'Department Head',
            roleDescription: 'Head of the Department',
            status: 1,
            permissions: [
              {
                menuId: "1",
                permissionId: "2"
              }
            ]
          }
        }
      */

      const plainToken = req.plainToken;
      const role: IRole = req.body;

      logger.debug(
        `${logPrefix} :: Role parameters :: ${JSON.stringify(role)}`
      );

      const { error } = rolesValidations.validateUpdateRole(role);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.roles.ROLE00000.errorCode,
          errorMessage,
        });
        return;
      }

      const roleExistsById = await rolesRepository.existsByRoleId(role.role_id);
      if (!roleExistsById) {
        logger.warn(`${logPrefix} :: Role not found with ID ${role.role_id}`);
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(ErrorCodes.roles.ROLE00006);
        return;
      }

      role.updated_by = plainToken?.teacherId;
      await rolesService.updateRole(role);

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
      const roleId = plainToken?.roleId;

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
        roleId as string,
        searchFilter
      );

      const rolesCount = await rolesService.listRolesCount(
        isActive,
        roleId as string,
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
  getAccessListByRoleId: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getAccessListByRoleId`;
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
            type: 'string',
            description: 'Role ID for which to fetch access list'
        }
      */

      const roleId: string = req.params.roleId;

      if (!roleId) {
        logger.warn(`${logPrefix} :: Missing roleId in request params`);
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(ErrorCodes.roles.ROLE00003);
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: roleId :: ${roleId}`);

      const roleExists = await rolesRepository.existsByRoleId(roleId);
      if (!roleExists) {
        logger.warn(`${logPrefix} :: Role not found with ID ${roleId}`);
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .send(ErrorCodes.roles.ROLE00006);
        return;
      }

      const accessList = await rolesService.getAccessListByRoleId(roleId);

      logger.info(`${logPrefix} :: Access list fetched successfully`);

      res.status(HttpStatusCodes.OK).send({
        data: accessList,
        message: "Access List Fetched Successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: Error`, error);
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(ErrorCodes.roles.ROLE00000);
    }
  },
  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `updateStatus`;
    try {
      logger.info(` ${logPrefix} :: Request received`);
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
      */
      const { roleId, status } = req.body;

      if (!roleId || !status) {
        logger.warn(` ${logPrefix} :: Missing roleId or status`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ROLE002",
          message: "roleId and status are required",
        });
        return;
      }

      await rolesService.updateRoleStatus(roleId, status);

      res.status(HttpStatusCodes.OK).send({
        message: "Role Status Updated Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },
  getRoleById: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getRoleById`;
    try {
      logger.info(` ${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get Role By ID'
        #swagger.description = 'Endpoint to retrieve Role By ID'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */
      const roleId = req.params.roleId;
  
      if (!roleId) {
        logger.warn(` ${logPrefix} :: Missing roleId`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ROLE002",
          message: "roleId is required",
        });
        return;
      }
  
      const role = await rolesService.getRoleById(roleId);
  
      if (!role) {
        logger.warn(`${logPrefix} :: Role not found for roleId :: ${roleId}`);
        res.status(HttpStatusCodes.NOT_FOUND).send({
          code: "ROLE003",
          message: "Role not found",
        });
        return;
      }
  
      res.status(HttpStatusCodes.OK).send({
        data: role,
        message: "Role Fetched Successfully",
      });
    } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.roles.ROLE00000);
        }
      },
};
export default rolesController;
