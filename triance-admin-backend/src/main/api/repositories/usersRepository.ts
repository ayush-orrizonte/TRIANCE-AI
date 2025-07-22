// // import { LoggerUtils } from "../../triance-commons";
// import { pgQueries } from "../../enums";
// import { IAdmin, IUser } from "../../types/custom";
// import { UserStatus } from "../../enums/status";
// import pgClient from "../../triance-commons/src/database/pg"; 

// function isError(error: unknown): error is Error {
//     return error instanceof Error;
// }

// const logger = LoggerUtils.getLogger("menusController");

// interface QueryResult {
//     rows: any[];
//     rowCount?: number;
// }
// const usersRepository = {
// createUser: async (user: IAdmin): Promise<number> => {
//     const logPrefix = `usersRepository :: createUser :: user :: ${user.admin_email}`;
//     try {
//         const _query = {
//             text: pgQueries.UserQueries.CREATE_USER,
//             values: [
//                 user.admin_name,
//                 user.admin_email,
//                 user.password,
//                 user.invalidlogin_attempts,
//                 user.status,
//                 user.role_id,
//                 user.level
//             ],
//             timeout: 2000  
//         };

//         logger.debug(`${logPrefix} :: Executing query :: ${JSON.stringify(_query)}`);
        
//         const result = await pgClient.executeQuery<{ admin_id: number }>(_query);

//         logger.debug(`${logPrefix} :: Query result :: ${JSON.stringify(result)}`);

//         if (result.length === 0) {
//             logger.warn(`${logPrefix} :: No rows returned. Insert may have failed.`);
//             throw new Error('User not created');
//         }

//         const userId = result[0].admin_id;
//         logger.info(`${logPrefix} :: User created with ID :: ${userId}`);
//         return userId;
//     } catch (error: unknown) {
//         if (isError(error)) {
//             logger.error(`${logPrefix} :: Error :: ${error.message}`);
//             throw new Error(error.message);
//         }
//         throw new Error('Unknown error occurred during user creation');
//     }
// }
// }
// export default usersRepository;