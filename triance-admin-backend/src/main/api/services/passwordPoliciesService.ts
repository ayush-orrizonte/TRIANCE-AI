import { redisKeysFormatter } from "../../helpers";
import { CacheTTL, LoggerUtils, HttpStatusCodes, RedisUtils } from "../../triance-commons";
import { IPasswordPolicy } from "../../types/custom";
import { passwordPoliciesRepository } from "../repositories";
import { RedisKeys } from "../../enums";

const redisUtils = RedisUtils.getInstance();
const logger = LoggerUtils.getLogger("passwordPoliciesService");
function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const passwordPoliciesService = {
  createPasswordPolicy: async (passwordPolicy: IPasswordPolicy) => {
    const logPrefix = `passwordPolicyService :: createPasswordPolicy :: ${JSON.stringify(passwordPolicy)}`;
    try {
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.PASSWORD_POLICIES,
        {}
      );
  
      await passwordPoliciesRepository.createPasswordPolicy(passwordPolicy);
      await redisUtils.delete(key);
  
      logger.info(`${logPrefix} :: Password policy created and cache cleared`);
    } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
  
  updatePasswordPolicy: async (passwordPolicy: IPasswordPolicy & { _id: string }) => {
    const logPrefix = `passwordPolicyService :: updatePasswordPolicy :: ${JSON.stringify(passwordPolicy)}`;
    try {
      await passwordPoliciesRepository.updatePasswordPolicy(passwordPolicy);
  
      const baseKey = redisKeysFormatter.getFormattedRedisKey(RedisKeys.PASSWORD_POLICIES, {});
      const byIdKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.PASSWORD_POLICY_BY_ID,
        { passwordPolicyId: passwordPolicy._id.toString() }
      );
  
      await redisUtils.delete(baseKey);
      await redisUtils.delete(byIdKey);
  
      logger.info(`${logPrefix} :: Password policy updated and cache cleared`);
    } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
  listPasswordPolicies: async (): Promise<IPasswordPolicy[] | undefined> => {
    const logPrefix = `passwordPolicyService :: listPasswordPolicies`;
    try {
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.PASSWORD_POLICIES,
        {}
      );
      const cachedResult = await redisUtils.get(key);

      if (cachedResult) {
        logger.debug(
          `${logPrefix} :: returned from cachedResult :: ${cachedResult}`
        );
        return JSON.parse(cachedResult);
      }

      const passwordPolicies =
        await passwordPoliciesRepository.listPasswordPolicies();
      logger.debug(
        `${logPrefix} :: returned from DB :: ${passwordPolicies}`
      );
      if (passwordPolicies && passwordPolicies.length > 0)
        // redisUtils.set(key, JSON.stringify(passwordPolicies), CacheTTL.LONG);
      return passwordPolicies;
    } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
  getPasswordPolicyById: async ( passwordPolicyId: number): Promise<IPasswordPolicy  | undefined> => {
    const logPrefix = `passwordPolicyService :: getPasswordPolicyById :: passwordPolicyId :: ${passwordPolicyId}`;
    try {
      const key = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.PASSWORD_POLICY_BY_ID,
        { passwordPolicyId: passwordPolicyId.toString() }
      );
      const cachedResult = await redisUtils.get(key);
      if (cachedResult) {
        logger.debug(
          `${logPrefix} :: returned from cachedResult :: ${cachedResult}`
        );
        return JSON.parse(cachedResult);
      }

      const passwordPolicy =
        await passwordPoliciesRepository.getPasswordPolicyById(
          passwordPolicyId
        );
      logger.debug(
        `${logPrefix} :: returned from DB :: ${passwordPolicy}`
      );
      // if (passwordPolicy) redisUtils.set(key, JSON.stringify(passwordPolicy), CacheTTL.LONG);
      return passwordPolicy;
    } catch (error: unknown) {
    if (isError(error)) {
        logger.error(`${logPrefix} :: Error :: ${error.message}`);
        throw new Error(error.message);
    }}
    },
};

export default passwordPoliciesService;


