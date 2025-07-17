import { RedisKeys } from "../../enums/redisKeys";
import { redisKeysFormatter } from "../../helpers";
import {
  CacheTTL,
  LoggerUtils,
  RedisUtils,
  MailerUtils,
  EjsUtils,
} from "../../triance-commons";
import { IUser, IPasswordPolicy } from "../../types/custom";
import usersRepository from "../repositories/usersRepository";
// import { rolesRepository } from "../repositories";
import { UserStatus } from "../../enums/status";
import passwordPoliciesService from "../services/passwordPoliciesService";
import RandExp from "randexp";
import bcrypt from "bcryptjs";



function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("teacherController");
const redisUtils = RedisUtils.getInstance();
const mailerUtils = MailerUtils.getInstance();

const usersService = {
  createUser: async (user: IUser) => {
    const logPrefix = `usersService :: createUser :: user :: ${JSON.stringify(
      user
    )} `;
    const capitalize = (str: string): string =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    try {
      const passwordPolicies =
        await passwordPoliciesService.listPasswordPolicies();
            if (!passwordPolicies || passwordPolicies.length === 0) {
        const message = "No password policies found";
        logger.error(`${logPrefix} :: ${message}`);
        return { success: false, message };
        }
      const passwordPolicy = passwordPolicies[0];

      const { encryptedPassword, plainPassword } =
        await usersService.generatePasswordFromPasswordPolicy(passwordPolicy);
      user.password = encryptedPassword;
      user.display_name = capitalize(user.first_name.trim());
      user.user_name = user.mobile_number.toString();
      user.status = UserStatus.ACTIVE;
      const userId = await usersRepository.createUser(user);

      if (!userId) {
        const message = "Failed to create user in the database";
        logger.error(`${logPrefix} :: ${message}`);
        return { success: false, message };
      }
      logger.info(
        `${logPrefix} :: User created successfully with ID ${userId}`
      );

    //   await usersService.clearRedisCache(userId, user.mobile_number);

      const emailTemplateHtml = await EjsUtils.generateHtml(
        "src/main/views/generic_template.ejs",
        {
          name: user.first_name,
          body: "Password has been generated for you",
          password: plainPassword,
          footer: "Please use this password to login into the system.",
        }
      );

      await mailerUtils.sendEmail(
        "Triance | Login Details",
        emailTemplateHtml,
        user.email_id
      );

      return { success: true, userId };
    } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
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