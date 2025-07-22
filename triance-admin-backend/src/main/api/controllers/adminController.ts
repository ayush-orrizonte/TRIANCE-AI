import { Response } from "express";
import { Request } from "../../types/express";
import { LoggerUtils, HttpStatusCodes } from "../../triance-commons";
import { ErrorCodes } from "../../enums";
import { IAdmin } from "../../types/custom";
import adminValidations from "../validations/adminsValidations";
import adminService from "../services/adminService";
import adminRepository from "../repositories/adminsRepository";
import rolesRepository from "../repositories/rolesRepository";
import { encDecHelper } from "../../helpers";
import { GridDefaultOptions } from "../../enums/status";

const logger = LoggerUtils.getLogger("adminController");

const adminController = {
  createAdmin: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "createAdmin";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Add Admin'
        #swagger.description = 'Endpoint to Add Admin'
        
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            admin_name: 'Admin User',
            admin_email: 'admin@example.com',
            role_id: '1',
            level: 'super'
          }
        }
      */

      const adminData: IAdmin = req.body;
      logger.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(adminData)}`);

      // const { error } = adminValidations.validateCreateAdmin(adminData);
      // if (error) {
      //   const errorMessage = error.details?.[0]?.message || error.message;
      //   logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
      //   res.status(HttpStatusCodes.BAD_REQUEST).send({
      //     errorCode: ErrorCodes.admins.ADMIN000.errorCode,
      //     errorMessage,
      //   });
      //   return;
      // }

      // const roleExists = await rolesRepository.existsByRoleId(adminData.role_id);
      // if (!roleExists) {
      //   logger.warn(`${logPrefix} :: Role not found with ID ${adminData.role_id}`);
      //   res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
      //   return;
      // }

      // const adminExists = await adminRepository.existsByAdminEmail(adminData.admin_email);
      // if (adminExists) {
      //   logger.warn(`${logPrefix} :: Admin email already exists`);
      //   res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
      //   return;
      // }

      await adminService.createAdmin(adminData);

      logger.info(`${logPrefix} :: Admin created successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Created Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  updateAdmin: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateAdmin";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Update Admin'
        #swagger.description = 'Endpoint to Update Admin'
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
            admin_id: 'encryptedHash',
            admin_name: 'Admin User',
            admin_email: 'admin@example.com',
            role_id: '1',
            level: 'super'
          }
        }
      */

      const admin: IAdmin = {
        ...req.body,
        admin_id: Number(req.body.admin_id),
        
      };
      console.log(`admin_id raw from req.body:`, req.body.admin_id);

      logger.debug(`admin_id (Number converted): ${admin.admin_id} :: type: ${typeof admin.admin_id}`);


      logger.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(admin)}`);

      const { error } = adminValidations.validateUpdateAdmin(admin);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.admins.ADMIN000.errorCode,
          errorMessage,
        });
        return;
      }

      const roleExists = await rolesRepository.existsByRoleId(admin.role_id);
      if (!roleExists) {
        logger.warn(`${logPrefix} :: Role not found with ID ${admin.role_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.roles.ROLE00006);
        return;
      }

      const adminExists = await adminRepository.existsByAdminId(admin.admin_id);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${admin.admin_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      await adminService.updateAdmin({
  ...admin,
  admin_id: Number(admin.admin_id)
});


      logger.info(`${logPrefix} :: Admin updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  getAdminById: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "getAdminById";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Get Admin'
        #swagger.description = 'Endpoint to Retrieve Admin Information By Admin Id'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const adminId = req.params.adminId;
      if (!adminId) {
        logger.warn(`${logPrefix} :: Missing adminId in request params`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN002",
          message: "adminId is required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: adminId :: ${adminId}`);

      const adminIdNumber = Number(adminId);
      if (isNaN(adminIdNumber)) {
        logger.warn(`${logPrefix} :: Invalid adminId format ${adminId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN003",
          message: "adminId must be a valid number",
        });
        return;
      }

      const adminExists = await adminRepository.existsByAdminId(adminIdNumber);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${adminId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      const admin = await adminService.getAdminById(adminIdNumber);

      logger.info(`${logPrefix} :: Admin fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: admin,
        message: "Admin Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  listAdminsByRoleId: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "listAdminsByRoleId";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'List Admins'
        #swagger.description = 'Endpoint to Retrieve Admins List By Role Id'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const roleId = req.params.roleId;
      if (!roleId) {
        logger.warn(`${logPrefix} :: Missing roleId in request params`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN007);
        return;
      }

      const roleIdNumber = Number(roleId);
      if (isNaN(roleIdNumber)) {
        logger.warn(`${logPrefix} :: Invalid roleId format ${roleId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN008",
          message: "roleId must be a valid number",
        });
        return;
      }

      logger.info(`${logPrefix} :: Fetching admins for roleId :: ${roleId}`);
      const admins = await adminService.getAdminsByRoleId(roleIdNumber);
      logger.info(`${logPrefix} :: Admins fetched successfully`);

      res.status(HttpStatusCodes.OK).send({
        data: admins,
        message: "Admins Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  resetPasswordForAdminId: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "resetPasswordForAdminId";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Reset Admin Password'
        #swagger.description = 'Endpoint to Reset Admin Password'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const adminId = req.params.adminId;
      if (!adminId) {
        logger.warn(`${logPrefix} :: Missing adminId in request params`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN006);
        return;
      }

      const adminIdNumber = Number(adminId);
      if (isNaN(adminIdNumber)) {
        logger.warn(`${logPrefix} :: Invalid adminId format ${adminId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN009",
          message: "adminId must be a valid number",
        });
        return;
      }

      const adminExists = await adminRepository.existsByAdminId(adminIdNumber);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${adminId}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      await adminService.resetPasswordForAdminId(adminIdNumber);

      logger.info(`${logPrefix} :: Admin password reset successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Password Reset Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  listAdmins: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "listAdmins";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'List Admins'
        #swagger.description = 'Endpoint to Retrieve Admins List'
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
            page_size: 50,
            current_page: 1,
            search_query: 'admin@example.com'
          }
        }
      */

      const pageSize = req.body.page_size || GridDefaultOptions.PAGE_SIZE;
      let currentPage = req.body.current_page || GridDefaultOptions.CURRENT_PAGE;
      const searchQuery = req.body.search_query || "";
      
      logger.debug(`${logPrefix} :: Parsed parameters :: pageSize: ${pageSize}, currentPage: ${currentPage}, searchQuery: ${searchQuery}`);

      if (currentPage > 1) {
        currentPage = (currentPage - 1) * pageSize;
      } else {
        currentPage = 0;
      }

      const adminsList = await adminService.listAdmins(pageSize, currentPage, searchQuery);
      const adminsCount = await adminService.getAdminsCount(searchQuery);

      logger.info(`${logPrefix} :: Admins listed successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: { adminsList, adminsCount },
        message: "Admins Fetched Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  updateAdminStatus: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateAdminStatus";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Update Admin Status'
        #swagger.description = 'Update Admin Status by Admin Id and Status'
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
            admin_id: 'encryptedHash',
            status: 1
          }
        }
      */

      const { admin_id, status } = req.body;
      if (!admin_id || status === undefined) {
        logger.warn(`${logPrefix} :: Missing admin_id or status`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN010",
          message: "admin_id and status are required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: admin_id: ${admin_id}, status: ${status}`);

      const { error } = adminValidations.validateUpdateAdminStatus(req.body);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        logger.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.admins.ADMIN000.errorCode,
          errorMessage,
        });
        return;
      }

      const decryptedAdminId = parseInt(encDecHelper.decryptPayload(admin_id));
      const adminExists = await adminRepository.existsByAdminId(decryptedAdminId);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${admin_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      // await adminService.updateAdminStatus(decryptedAdminId, status, req.plainToken.id);

      logger.info(`${logPrefix} :: Admin status updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Status Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  updateLoginAttempts: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateLoginAttempts";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Update Admin Login Attempts'
        #swagger.description = 'Update Admin Invalid Login Attempts Count'
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
            admin_id: 'encryptedHash',
            invalidlogin_attempts: 2
          }
        }
      */

      const { admin_id, invalidlogin_attempts } = req.body;
      if (!admin_id || invalidlogin_attempts === undefined) {
        logger.warn(`${logPrefix} :: Missing admin_id or invalidlogin_attempts`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN012",
          message: "admin_id and invalidlogin_attempts are required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: admin_id: ${admin_id}, attempts: ${invalidlogin_attempts}`);

      const decryptedAdminId = parseInt(encDecHelper.decryptPayload(admin_id));
      const adminExists = await adminRepository.existsByAdminId(decryptedAdminId);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${admin_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      await adminService.updateLoginAttempts(decryptedAdminId, invalidlogin_attempts);

      logger.info(`${logPrefix} :: Admin login attempts updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Login Attempts Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },

  updateLastLogin: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = "updateLastLogin";
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Admins']
        #swagger.summary = 'Update Admin Last Login'
        #swagger.description = 'Update Admin Last Login Timestamp'
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
            admin_id: 'encryptedHash'
          }
        }
      */

      const { admin_id } = req.body;
      if (!admin_id) {
        logger.warn(`${logPrefix} :: Missing admin_id`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          code: "ADMIN013",
          message: "admin_id is required",
        });
        return;
      }

      logger.debug(`${logPrefix} :: Parsed parameters :: admin_id: ${admin_id}`);

      const decryptedAdminId = parseInt(encDecHelper.decryptPayload(admin_id));
      const adminExists = await adminRepository.existsByAdminId(decryptedAdminId);
      if (!adminExists) {
        logger.warn(`${logPrefix} :: Admin not found with ID ${admin_id}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.admins.ADMIN005);
        return;
      }

      await adminService.updateLastLogin(decryptedAdminId);

      logger.info(`${logPrefix} :: Admin last login updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Admin Last Login Updated Successfully",
      });
    } catch (error: any) {
      logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.admins.ADMIN000);
    }
  },
    health: (req: Request, res: Response): void => {
    /*  
      #swagger.tags = ['Admins']
      #swagger.summary = 'Health Check API'
      #swagger.description = 'Endpoint to health check Admin Service'
    */
    res.status(HttpStatusCodes.OK).send({
      data: null,
      message: "Admin Service is Up and Running!",
    });
  },
};

export default adminController;
