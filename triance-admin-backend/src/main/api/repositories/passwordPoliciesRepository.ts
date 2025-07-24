import { pgQueries } from "../../enums";
import { IPasswordPolicy } from "../../types/custom";
import { pg } from "../../triance-commons/src/database";
import { LoggerUtils } from "../../triance-commons/src/audit/loggerUtils";
import pgClient from "../../triance-commons/src/database/pg";

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("passwordPoliciesRepository");

interface QueryResult {
    rows: any[];
    rowCount?: number;
}

const passwordPoliciesRepository = {
  listPasswordPolicies: async (): Promise<IPasswordPolicy[]> => {
    const logPrefix = `passwordPoliciesRepository :: listPasswordPolicies`;
    try {
      
      const query = pgQueries.PasswordPolicyQueries.LIST_PASSWORD_POLICIES;
logger.debug(`${logPrefix} :: query :: ${query}`);

const result = await pgClient.executeQuery(query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
      return result;
    }  catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

  createPasswordPolicy: async (passwordPolicy: IPasswordPolicy) => {
    const logPrefix = 'createPasswordPolicy';
    try {
      const dbData = {
        password_expiry: passwordPolicy.password_expiry,
        password_history: passwordPolicy.password_history,
        minimum_password_length: passwordPolicy.minimum_password_length,
        complexity: passwordPolicy.complexity,
        alphabetical: passwordPolicy.alphabetical ? 1 : 0,
        numeric: passwordPolicy.numeric ? 1 : 0,
        special_characters: passwordPolicy.special_characters,
        allowed_special_characters: passwordPolicy.allowed_special_characters,
        maximum_invalid_attempts: passwordPolicy.maximum_invalid_attempts,
        date_updated: passwordPolicy.date_updated || new Date()
      };
      const _query = {
        text: `
          INSERT INTO password_policies(
            password_expiry, 
            password_history, 
            minimum_password_length, 
            complexity, 
            alphabetical, 
            numeric, 
            special_characters,
            allowed_special_characters,
            maximum_invalid_attempts,
            date_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `,
        values: [
          dbData.password_expiry,
          dbData.password_history,
          dbData.minimum_password_length,
          dbData.complexity,
          dbData.alphabetical, 
          dbData.numeric, 
          dbData.special_characters,
          dbData.allowed_special_characters,
          dbData.maximum_invalid_attempts,
          dbData.date_updated
        ]
      };

      const result = await pgClient.executeQuery(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
      return result;
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
    }  catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },

  updatePasswordPolicy: async (passwordPolicy: IPasswordPolicy & { id: string }) => {
    const logPrefix = `passwordPoliciesRepository :: updatePasswordPolicy :: passwordPolicy :: ${JSON.stringify(passwordPolicy)}`;
    try {
      
      const dbData = {
        id: passwordPolicy.id, 
        password_expiry: passwordPolicy.password_expiry,
        password_history: passwordPolicy.password_history,
        minimum_password_length: passwordPolicy.minimum_password_length,
        complexity: passwordPolicy.complexity,
        alphabetical: passwordPolicy.alphabetical ? 1 : 0, 
        numeric: passwordPolicy.numeric ? 1 : 0, 
        special_characters: passwordPolicy.special_characters? 1 : 0, 
        allowed_special_characters: passwordPolicy.allowed_special_characters,
        maximum_invalid_attempts: passwordPolicy.maximum_invalid_attempts
      };

      const _query = {
        text: pgQueries.PasswordPolicyQueries.UPDATE_PASSWORD_POLICY,
        values: [
          dbData.id,
          dbData.password_expiry,
          dbData.password_history,
          dbData.minimum_password_length,
          dbData.complexity,
          dbData.alphabetical,
          dbData.numeric,
          dbData.special_characters,
          dbData.allowed_special_characters,
          dbData.maximum_invalid_attempts
        ],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQuery(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
      return result;
    } catch (error: unknown) {
      if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred');
    }
},

  existByPasswordPolicyId: async (passwordPolicyId: number): Promise<boolean> => {
    const logPrefix = `passwordPoliciesRepository :: existByPasswordPolicyId :: passwordPolicyId :: ${passwordPolicyId}`;
    try {
      const _query = {
        text: pgQueries.PasswordPolicyQueries.EXISTS_BY_PASSWORD_POLICY_ID,
        values: [passwordPolicyId],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQuery(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
      return result && result.length > 0 ? result[0].exists : false;
    }  catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },
  getPasswordPolicyById: async (passwordPolicyId: number): Promise<IPasswordPolicy> => {
    const logPrefix = `passwordPoliciesRepository :: getPasswordPolicyById :: passwordPolicyId :: ${passwordPolicyId}`;
    try {
      const query = {
        text: "SELECT * FROM password_policies WHERE id = $1",
        values: [passwordPolicyId]
      };

      logger.debug(`${logPrefix} :: Executing query`);
      const result = await pg.executeQuery<IPasswordPolicy>(query);

      if (!result || result.length === 0) {
        logger.warn(`${logPrefix} :: No policy found`);
        throw new Error(`Password policy with ID ${passwordPolicyId} not found`);
      }

      logger.debug(`${logPrefix} :: Success`);
      return result[0];
    }  catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },
};

export default passwordPoliciesRepository;


