import { LoggerUtils } from "../../triance-commons";
import { pgQueries } from "../../enums";
import { IUser } from "../../types/custom";
import { UserStatus } from "../../enums/status";
import pgClient from "../../triance-commons/src/database/pg"; 

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const logger = LoggerUtils.getLogger("menusController");

interface QueryResult {
    rows: any[];
    rowCount?: number;
}
const usersRepository = {
createUser: async (user: IUser): Promise<number> => {
        const logPrefix = `usersRepository :: createUser :: user :: ${JSON.stringify(user)}`;
        try {
            const _query = {
                text: pgQueries.UserQueries.CREATE_USER,
                values: [
                    user.user_name,
                    user.first_name,
                    user.last_name,
                    user.display_name,
                    user.mobile_number,
                    user.password,
                    user.role_id,
                    user.email_id,
                    user.created_by,
                    user.updated_by
                ]
            };

            logger.debug(`${logPrefix} :: Executing query :: ${JSON.stringify(_query)}`);
            const result = await pgClient.executeQuery(_query);
            logger.debug(`${logPrefix} :: Query result :: ${JSON.stringify(result)}`);

            const userId = result.length > 0 ? result[0].user_id : false;
            return userId;
        }catch (error: unknown) {
            if (isError(error)) {
                logger.error(`${logPrefix} :: Error :: ${error.message}`);
                throw new Error(error.message);
            }
            throw new Error('Unknown error occurred');
        }
    },
}
export default usersRepository;