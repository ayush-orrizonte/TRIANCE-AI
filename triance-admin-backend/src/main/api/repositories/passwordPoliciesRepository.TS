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
          passwordPolicy.password_expiry,
          passwordPolicy.password_history,
          passwordPolicy.minimum_password_length,
          passwordPolicy.complexity,
          passwordPolicy.alphabetical,
          passwordPolicy.numeric,
          passwordPolicy.special_characters,
          passwordPolicy.allowed_special_characters,
          passwordPolicy.maximum_invalid_attempts,
          passwordPolicy.date_updated || new Date()
        ]
      };

      const result = await pgClient.executeQuery(_query);
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

  updatePasswordPolicy: async (passwordPolicy: IPasswordPolicy) => {
    const logPrefix = `passwordPoliciesRepository :: updatePasswordPolicy :: passwordPolicy :: ${JSON.stringify(passwordPolicy)}`;
    try {
      const _query = {
        text: pgQueries.PasswordPolicyQueries.UPDATE_PASSWORD_POLICY,
        values: [
          passwordPolicy.id,
          passwordPolicy.password_expiry,
          passwordPolicy.password_history,
          passwordPolicy.minimum_password_length,
          passwordPolicy.complexity,
          passwordPolicy.alphabetical,
          passwordPolicy.numeric,
          passwordPolicy.special_characters,
          passwordPolicy.allowed_special_characters,
          passwordPolicy.maximum_invalid_attempts,
        ],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQuery(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
    }  catch (error: unknown) {
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
      const _query = {
        text: pgQueries.PasswordPolicyQueries.GET_PASSWORD_POLICY_BY_ID,
        values: [passwordPolicyId],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQuery(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);
      if (!result || result.length === 0) {
        throw new Error(`Password policy with ID ${passwordPolicyId} not found`);
        }
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

