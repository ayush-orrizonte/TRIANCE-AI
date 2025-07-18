import { LoggerUtils, MongoDBUtils } from "gm-commons";
import { IAdmin } from "../../types/custom";
import { AdminModel } from "../../models";
import { MongoCollections, Status } from "../../enums";
import { UserStatus } from "../../enums/status";

const logger = LoggerUtils.getLogger("teacherRepository");
const mongoDBUtils = MongoDBUtils.getInstance();

    const adminRepository = {
    getAdminByEmail: async (email: string): Promise<IAdmin | null> => {
      const logPrefix = `getAdminByEmail :: email :: ${email}`;
      try {
        console.info(logPrefix);
        const admins = await mongoDBUtils.findWithOptions<IAdmin>(
          AdminModel.userModel,
          {
            emailId: email,
            status: { $nin: [UserStatus.INACTIVE, UserStatus.DELETED] },
          },
          {
            projection: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
            },
          }
        );
  
        console.debug(`${logPrefix} :: admins :: ${JSON.stringify(admins)}`);
        return admins.length > 0 ? admins[0] : null;
      } catch (error) {
        console.error(`${logPrefix} :: error :: ${error.message}`);
        throw error;
      }
    },
  
    incrementInvalidLoginAttempts: async (email: string) => {
      const logPrefix = `incrementInvalidLoginAttempts :: email :: ${email}`;
      try {
        console.info(logPrefix);
        await mongoDBUtils.updateOne<IAdmin>(
            AdminModel.userModel,
          { email },
          { $inc: { invalidAttempts: 1 } }
        );
        console.debug(`${logPrefix} :: invalid attempts incremented`);
      } catch (error) {
        console.error(`${logPrefix} :: error :: ${error.message}`);
        throw error;
      }
    },
  
    updateAdminStatus: async (
      status: UserStatus,
      email: string,
      clearInvalidAttempts?: boolean
    ) => {
      const logPrefix = `updateUserStatus :: status :: ${status} :: email :: ${email}`;
      try {
        console.info(logPrefix);
  
        const updateQuery: any = { status };
        if (clearInvalidAttempts) updateQuery.invalidAttempts = 0;
        if (status === UserStatus.LOGGED_IN)
          updateQuery.lastLoggedIn = new Date().toISOString();
  
        await mongoDBUtils.updateOne<IAdmin>(
            AdminModel.userModel,
          { email },
          { $set: updateQuery }
        );
        console.debug(`${logPrefix} :: Admin status updated`);
      } catch (error) {
        console.error(`${logPrefix} :: error :: ${error.message}`);
        throw error;
      }
    },
  
    resetPassword: async (
      newPassword: string,
      userId: string
    ): Promise<boolean> => {
      const logPrefix = `resetPassword :: adminId :: ${userId}`;
      try {
        console.info(logPrefix);
        await mongoDBUtils.updateOne<IAdmin>(
            AdminModel.userModel,
          { userId },
          { $set: { password: newPassword } }
        );
        return true;
      } catch (error) {
        console.error(`${logPrefix} :: error :: ${error.message}`);
        throw error;
      }
    },
    getAdminById : async (adminId: string): Promise<IAdmin | null> => {
        const logPrefix = `getAdminById :: adminId :: ${adminId}`;
        try {
          logger.info(logPrefix);
          const admins = await mongoDBUtils.findWithOptions<IAdmin>(
            AdminModel.userModel,
            {
              adminId,
              status: {
                $nin: [Status.UserStatus.INACTIVE, Status.UserStatus.DELETED],
              },
            },
            {
              projection: {
                _id: 0,
                password: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
              },
            }
          );
      
          logger.debug(`${logPrefix} :: admins :: ${JSON.stringify(admins)}`);
          return admins.length > 0 ? admins[0] : null;
        } catch (error: any) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          throw error;
        }
      },
      existsByEmail: async (emailId: string): Promise<boolean> => {
        const logPrefix = `adminRepository :: existsByEmail :: emailId :: ${emailId}`;
        try {
          logger.info(logPrefix);
      
          const adminExists = await mongoDBUtils.exists<IAdmin>(
            AdminModel.userModel,
            {
              emailId,
              status: { $nin: [Status.UserStatus.INACTIVE, Status.UserStatus.DELETED] },
            }
          );
      
          logger.debug(`${logPrefix} :: adminExists :: ${adminExists}`);
          return adminExists;
        } catch (error) {
          logger.error(`${logPrefix} :: error :: ${error.message} :: ${error}`);
          throw error;
        }
      },
      getUserByUserName: async (userName: string): Promise<IAdmin> => {
        const logPrefix = `adminRepository :: getUserByUserName :: userName :: ${userName}`;
        try {
          logger.debug(`${logPrefix} :: Fetching user from MongoDB`);
      
          const result = await mongoDBUtils.findWithOptions(
            AdminModel.userModel,
            {
              user_name: userName,
              status: { $ne: Status.UserStatus.DELETED },
            },
            {
              projection: {
                _id: 0,
              },
            }
          );
      
          logger.debug(`${logPrefix} :: MongoDB result :: ${JSON.stringify(result)}`);
      
          if (result.length === 0) {
            logger.warn(`${logPrefix} :: No admin found with email`);
           
          }
          
          return result[0];
        } catch (error) {
          logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
          throw new Error(error.message);
        }
      },
      
      
  }

  
  export default adminRepository;
