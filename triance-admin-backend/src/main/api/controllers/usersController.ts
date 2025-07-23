// import { Response } from "express";
// import { Request } from "../../types/express";
// import { HttpStatusCodes, LoggerUtils } from "../../triance-commons";
// import { IAdmin } from "../../types/custom";
// import { ErrorCodes } from "../../enums";
// // import { GridDefaultOptions } from "../../enums/status";
// import usersRepository from "../repositories/usersRepository";
// import usersService from "../services/usersService";
// import usersValidations from "../validations/usersValidations";
// // import rolesRepository from "../repositories/rolesRepository";

// const logger = LoggerUtils.getLogger("usersController");

// const usersController = {
//     createUser: async (req: Request, res: Response): Promise<void> => {
//     const logPrefix = `usersController :: createUser`;
//     try {
//       logger.info(`${logPrefix} :: Request received`);

//       /*
//         #swagger.tags = ['Users']
//         #swagger.summary = 'Add User'
//         #swagger.description = 'Endpoint to Add User'
        
        
//         #swagger.parameters['body'] = {
//           in: 'body',
//           required: true,
//           schema: {
//             admin_name: 'Rajesh',
//             admin_email: 'rajeshnayak899@gmail.com',
//             role_id: 2,
//             level:'admin'
//           }
//         }
//       */

//       const plainToken = req.plainToken;
//       const user: IAdmin = req.body;

//       logger.debug(
//         `${logPrefix} :: Parsed parameters :: user :: ${JSON.stringify(user)}`
//       );

//       // const { error } = usersValidations.validateCreateUser(user);
//       // if (error) {
//       //   const message = error.details?.[0]?.message || error.message;
//       //   logger.warn(`${logPrefix} :: Validation failed :: ${message}`);
//       //   res.status(HttpStatusCodes.BAD_REQUEST).send({
//       //     code: ErrorCodes.users.USER00000.errorCode,
//       //     message,
//       //   });
//       //   return;
//       // }

//     //   const roleExists = await rolesRepository.existsByRoleId(user.role_id);
//     //   if (!roleExists) {
//     //     logger.warn(`${logPrefix} :: Role not found with ID ${user.role_id}`);
//     //     res
//     //       .status(HttpStatusCodes.BAD_REQUEST)
//     //       .send(ErrorCodes.roles.ROLE00006);
//     //     return;
//     //   }

//     //   const userExists = await usersRepository.existsByMobileNumber(
//     //     user.mobile_number
//     //   );
//     //   if (userExists) {
//     //     logger.warn(
//     //       `${logPrefix} :: User already exists with mobile ${user.mobile_number}`
//     //     );
//     //     res
//     //       .status(HttpStatusCodes.BAD_REQUEST)
//     //       .send(ErrorCodes.users.USER00005);
//     //     return;
//     //   }

     
//       await usersService.createUser(user);

//       logger.info(`${logPrefix} :: User created successfully`);

//       res.status(HttpStatusCodes.OK).send({
//         code: "USER200",
//         data: null,
//         message: "User Added Successfully",
//       });
//     } catch (error) {
//       logger.error(`${logPrefix} :: Error`, error);
//       res
//         .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
//         .send(ErrorCodes.users.USER00000);
//     }
//   },
// }
// export default usersController;