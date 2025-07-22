import { RedisKeys } from "../../enums/redisKeys";
import { redisKeysFormatter } from "../../helpers";
import {
  CacheTTL,
  LoggerUtils,
  RedisUtils,
  MailerUtils,
  EjsUtils,
} from "../../triance-commons";
import { IUser, IPasswordPolicy, IAdmin } from "../../types/custom";
// import { rolesRepository } from "../repositories";
import { UserStatus } from "../../enums/status";
import passwordPoliciesService from "./passwordPoliciesService";
import RandExp from "randexp";
import bcrypt from "bcryptjs";
import pgClient from "../../triance-commons/src/database/pg";
import { pgQueries } from "../../enums"; 
import { PoolClient } from 'pg';




function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("teacherController");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

const usersService = {
  createUser: async (user: IAdmin) => {
    const logPrefix = `usersService :: createUser`;
    let transactionClient: PoolClient | null | undefined = null;
    
    try {
        transactionClient = await pgClient.getPool()?.connect();
        if (!transactionClient) {
            throw new Error("Database connection failed");
        }

        await transactionClient.query('BEGIN');

        // Generate password and prepare user data
        const passwordPolicies = await passwordPoliciesService.listPasswordPolicies();
        if (!passwordPolicies || passwordPolicies.length === 0) {
            throw new Error("No password policies found");
        }

        const { encryptedPassword, plainPassword } = 
            await usersService.generatePasswordFromPasswordPolicy(passwordPolicies[0]);
        
        const userToCreate = {
            ...user,
            password: encryptedPassword,
            status: UserStatus.ACTIVE
        };

        // Create user
        const result = await transactionClient.query<{ admin_id: number }>({
            text: pgQueries.AdminQueries.CREATE_ADMIN,
            values: [
                userToCreate.admin_name,
                userToCreate.admin_email,
                userToCreate.password,
                userToCreate.profile_picture || null,
                new Date().toISOString(),
                userToCreate.invalidlogin_attempts || 0,
                userToCreate.status,
                userToCreate.role_id,
                userToCreate.level
            ]
        });

        if (result.rowCount === 0) {
            throw new Error("User creation failed");
        }

        const adminId = result.rows[0].admin_id;

        // Send email
        const emailTemplateHtml = await EjsUtils.generateHtml(
            "src/main/views/generic_template.ejs",
            {
                name: user.admin_name,
                body: "Password has been generated for you",
                password: plainPassword,
                footer: "Please use this password to login into the system.",
            }
        );

        await mailerUtils.sendEmail(
            "Triance | Login Details",
            emailTemplateHtml,
            user.admin_email
        );

        await transactionClient.query('COMMIT');
        
        return { success: true, userId: adminId };
    } catch (error) {
        if (transactionClient) {
            await transactionClient.query('ROLLBACK').catch(rollbackError => {
                logger.error(`${logPrefix} :: Rollback failed`, rollbackError);
            });
        }
        
        logger.error(`${logPrefix} :: Error`, error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : "Unknown error occurred"
        };
    } finally {
        if (transactionClient) {
            transactionClient.release();
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

    let pattern = "", tempStr = "";
    const alphabetical = /[A-Z][a-z]/;
    const numeric = /[0-9]/;
    const special = /[!@#$&*]/;

    const passwordLength = passwordPolicy.minimum_password_length || 8;

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
      tempStr = numeric.source;
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
}

}
export default usersService;