import { RedisKeys } from "../../enums";
import { redisKeysFormatter } from "../../helpers";
import { IAdmin,IPasswordPolicy  } from "../../types/custom";
import { adminRepository } from "../repositories";
import { CacheTTL, LoggerUtils, RedisUtils , MailerUtils, EjsUtils} from "../../triance-commons";
import passwordPoliciesService from "../services/passwordPoliciesService";
import bcrypt from "bcryptjs";
import RandExp from "randexp";
import { AdminStatus } from "../../enums/status";

const logger = LoggerUtils.getLogger("adminService");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const adminService = {
    createAdmin: async (admin: IAdmin) => {
    const logPrefix = `adminService :: createAdmin :: ${JSON.stringify(admin)}`;
    try {
      // Fetch password policies
      const passwordPolicies = await passwordPoliciesService.listPasswordPolicies();
      if (!passwordPolicies || passwordPolicies.length === 0) {
        const message = "No password policies found";
        logger.error(`${logPrefix} :: ${message}`);
        return { success: false, message };
      }
      const passwordPolicy = passwordPolicies[0];

      // Generate password
      const { encryptedPassword, plainPassword } =
        await adminService.generatePasswordFromPasswordPolicy(passwordPolicy);

      admin.password = encryptedPassword;
      admin.status = AdminStatus.ACTIVE;

      const adminId = await adminRepository.createAdmin(admin);

      if (!adminId) {
        const message = "Failed to create admin in the database";
        logger.error(`${logPrefix} :: ${message}`);
        return { success: false, message };
      }

      logger.info(`${logPrefix} :: Admin created successfully with ID ${adminId}`);

      const emailTemplateHtml = await EjsUtils.generateHtml(
        "src/main/views/generic_template.ejs",
        {
          name: admin.admin_name,
          body: "Your Admin account has been created successfully.",
          password: plainPassword,
          footer: "Please use this password to login into the system.",
        }
      );

      await mailerUtils.sendEmail(
        "Triance | Admin Login Details",
        emailTemplateHtml,
        admin.admin_email
      );

      await adminService.clearRedisCache();

      return { success: true, adminId };
    } catch (error: unknown) {
      if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
      }
    }
  },

  generatePasswordFromPasswordPolicy: async (
    passwordPolicy: IPasswordPolicy
  ): Promise<{ encryptedPassword: string; plainPassword: string }> => {
    const logPrefix = `generatePasswordFromPasswordPolicy :: passwordPolicy :: ${JSON.stringify(passwordPolicy)}`;
    try {
      logger.info(logPrefix);

      if (!passwordPolicy) {
        const message = "Password policy is undefined or missing!";
        logger.error(`${logPrefix} :: ${message}`);
        throw new Error(message);
      }

      const alphabetical = /[A-Z][a-z]/;
      const numeric = /[0-9]/;
      const special = /[!@#$&*]/;

      const passwordLength = passwordPolicy.minimum_password_length || 8;
      let tempStr = "";

      if (passwordPolicy.complexity && passwordPolicy.alphabetical) {
        tempStr += alphabetical.source;
      }
      if (passwordPolicy.complexity && passwordPolicy.numeric) {
        tempStr += numeric.source;
      }
      if (passwordPolicy.complexity && passwordPolicy.special_characters) {
        tempStr += special.source;
      }

      if (!tempStr) {
        tempStr = numeric.source; // fallback to numeric only
      }

      const patternSource = `[${tempStr}]{${passwordLength}}`;
      const regexPattern = new RegExp(patternSource);
      const randomExpression = new RandExp(regexPattern).gen();

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(randomExpression, salt);

      logger.debug(`${logPrefix} :: plainPassword :: ${randomExpression}`);

      return {
        encryptedPassword,
        plainPassword: randomExpression,
      };
    } catch (error: unknown) {
      if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
      } else {
        logger.error(`${logPrefix} :: Unknown Error :: ${JSON.stringify(error)}`);
        throw new Error("Unknown error occurred in generatePasswordFromPasswordPolicy.");
      }
    }
  },

    updateAdmin: async (admin: IAdmin) => {
        const logPrefix = `adminService :: updateAdmin :: ${JSON.stringify(admin)}`;
        try {
            await adminRepository.updateAdmin(admin);
            await adminService.clearRedisCache(admin.admin_id);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    getAdminById: async (admin_id: number): Promise<IAdmin | undefined> => {
        const logPrefix = `adminService :: getAdminById :: adminId :: ${admin_id}`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMIN_BY_ID, { admin_id: admin_id.toString() });
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(`${logPrefix} :: returned from cachedResult :: ${cacheResult}`);
                return JSON.parse(cacheResult);
            }

            const admin = await adminRepository.getAdminById(admin_id);
            logger.debug(`${logPrefix} :: returned from DB :: ${admin}`);
            if (admin) {
                redisUtils.set(key, JSON.stringify(admin), CacheTTL.LONG);
                return admin;
            }
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    listAdmins: async (pageSize: number, currentPage: number, searchQuery: string): Promise<IAdmin[] | undefined> => {
        const logPrefix = `adminService :: listAdmins`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMINS_LIST, { 
                pageSize: pageSize.toString(),
                currentPage: currentPage.toString(),
                searchQuery
            });
            
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(`${logPrefix} :: returned from cachedResult :: ${cacheResult}`);
                return JSON.parse(cacheResult);
            }

            const admins = await adminRepository.listAdmins(pageSize, currentPage, searchQuery);
            logger.debug(`${logPrefix} :: returned from DB :: ${admins}`);
            if (admins && admins.length > 0) {
                redisUtils.set(key, JSON.stringify(admins), CacheTTL.MID);
                return admins;
            }
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    getAdminsByRoleId: async (role_id: number): Promise<IAdmin[] | undefined> => {
        const logPrefix = `adminService :: getAdminsByRoleId :: roleId :: ${role_id}`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMINS_BY_ROLE_ID, { role_id: role_id.toString() });
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(`${logPrefix} :: returned from cachedResult :: ${cacheResult}`);
                return JSON.parse(cacheResult);
            }

            const admins = await adminRepository.getAdminsByRoleId(role_id);
            logger.debug(`${logPrefix} :: returned from DB :: ${admins}`);
            if (admins && admins.length > 0) {
                redisUtils.set(key, JSON.stringify(admins), CacheTTL.MID);
                return admins;
            }
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    updateAdminStatus: async (admin_id: number, status: number, updated_by: number) => {
        const logPrefix = `adminService :: updateAdminStatus :: adminId :: ${admin_id} :: status :: ${status}`;
        try {
            await adminRepository.updateAdminStatus(admin_id, status, updated_by);
            await adminService.clearRedisCache(admin_id);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    resetPasswordForAdminId: async (admin_id: number) => {
        const logPrefix = `adminService :: resetPasswordForAdminId :: adminId :: ${admin_id}`;
        try {
            await adminRepository.resetPasswordForAdminId(admin_id);
            await adminService.clearRedisCache(admin_id);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    updateLoginAttempts: async (admin_id: number, invalidlogin_attempts: number) => {
        const logPrefix = `adminService :: updateLoginAttempts :: adminId :: ${admin_id} :: attempts :: ${invalidlogin_attempts}`;
        try {
            await adminRepository.updateLoginAttempts(admin_id, invalidlogin_attempts);
            await adminService.clearRedisCache(admin_id);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    updateLastLogin: async (admin_id: number) => {
        const logPrefix = `adminService :: updateLastLogin :: adminId :: ${admin_id}`;
        try {
            await adminRepository.updateLastLogin(admin_id);
            await adminService.clearRedisCache(admin_id);
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    },

    getAdminsCount: async (searchQuery: string): Promise<number> => {
        const logPrefix = `adminService :: getAdminsCount`;
        try {
            const key = redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMINS_COUNT, { searchQuery });
            const cacheResult = await redisUtils.get(key);
            if (cacheResult) {
                logger.debug(`${logPrefix} :: returned from cachedResult :: ${cacheResult}`);
                return parseInt(cacheResult);
            }

            const count = await adminRepository.getAdminsCount(searchQuery);
            logger.debug(`${logPrefix} :: returned from DB :: ${count}`);
            redisUtils.set(key, count.toString(), CacheTTL.MID);
            return count;
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            return 0;
        }
    },

    clearRedisCache: async (admin_id?: number) => {
        const logPrefix = `adminService :: clearRedisCache :: adminId :: ${admin_id}`;
        try {
            if (admin_id) {
                await redisUtils.delete(
                    redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMIN_BY_ID, { 
                        admin_id: admin_id.toString() 
                    })
                );
            }
            
            
            await redisUtils.delete(
                redisKeysFormatter.getFormattedRedisKey(RedisKeys.ADMINS_COUNT, {})
            );
        } catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
        }
    }
};

export default adminService;