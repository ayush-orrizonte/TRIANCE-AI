import { Response } from "express";
import { LoggerUtils, HttpStatusCodes } from "../../triance-commons";
import { Request } from "../../types/express";
import { ErrorCodes } from "../../enums";
import  { passwordPoliciesService} from "../services" ;
import { IPasswordPolicy } from "../../types/custom";
import  passwordPoliciesValidations  from "../validations/passwordPoliciesValidations";
import { PasswordPolicyModel } from "../../models";
import { passwordPoliciesRepository } from "../repositories";
import { v4 as uuidv4 } from "uuid";

const log = LoggerUtils.getLogger("passwordPoliciesController");

const passwordPoliciesController = {
  listPasswordPolicies: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `listPasswordPolicies`;
    try {
      log.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Password Policies']
        #swagger.summary = 'List Password Policies'
        #swagger.description = 'Endpoint to list all Password Policies'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
      */

      const passwordPolicies = await passwordPoliciesService.listPasswordPolicies();

      res.status(HttpStatusCodes.OK).send({
        data: passwordPolicies,
        message: "Password Policies Fetched Successfully",
      });
    } catch (error: any) {
      log.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.password_policies.PASSWORDPOLICIES000);
    }
  },

  addPasswordPolicy: async (req: Request, res: Response): Promise<void> => {
  const logPrefix = `addPasswordPolicy`;
  try {
    log.info(`${logPrefix} :: Request received`);

    /*
      #swagger.tags = ['Password Policies']
      #swagger.summary = 'Add Password Policy'
      #swagger.description = 'Endpoint to create a new Password Policy'
      
      /*
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          passwordExpiry: 90,
          passwordHistory: 5,
          minimumPasswordLength: 8,
          complexity: 3,
          alphabetical: true,
          numeric: true,
          specialCharacters: true,
          allowedSpecialCharacters: '!@#$%^&*()',
          maximumInvalidAttempts: 5
        }
      }
    */


    const passwordPolicyData = req.body;

    // const { error } = passwordPoliciesValidations.validateCreatePasswordPolicy(passwordPolicyData);
    // if (error) {
    //   const errorMessage = error.details?.[0]?.message || error.message;
    //   log.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
    //   res.status(HttpStatusCodes.BAD_REQUEST).send({
    //     errorCode: ErrorCodes.password_policies.PASSWORDPOLICIES000.errorCode,
    //     errorMessage,
    //   });
    //   return;
    // }

   
    const passwordPolicy: IPasswordPolicy = passwordPolicyData;
    log.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(passwordPolicy)}`);

    await passwordPoliciesService.createPasswordPolicy(passwordPolicy);

    log.info(`${logPrefix} :: Password Policy created successfully`);
    res.status(HttpStatusCodes.OK).send({
      data: null,
      message: "Password Policy Added Successfully",
    });
  } catch (error: any) {
    log.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.password_policies.PASSWORDPOLICIES000);
  }
},

  updatePasswordPolicy: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `updatePasswordPolicy`;
    try {
      log.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Password Policies']
        #swagger.summary = 'Update Password Policy'
        #swagger.description = 'Endpoint to update an existing Password Policy'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            _id: "60fead1d5d3e2c001f8e4e72",
            minimumPasswordLength: 8,
            complexity: 3,
            alphabetical: true,
            numeric: true,
            specialCharacters: true,
            allowedSpecialCharacters: '!@#$%^&*()',
            maximumInvalidAttempts: 5
          }
        }
      */

        const passwordPolicy: IPasswordPolicy & { _id: string } = req.body;
      log.debug(`${logPrefix} :: Parsed parameters :: ${JSON.stringify(passwordPolicy)}`);

      const { error } = passwordPoliciesValidations.validateUpdatePasswordPolicy(passwordPolicy);
      if (error) {
        const errorMessage = error.details?.[0]?.message || error.message;
        log.warn(`${logPrefix} :: Validation error :: ${errorMessage}`);
        res.status(HttpStatusCodes.BAD_REQUEST).send({
          errorCode: ErrorCodes.password_policies.PASSWORDPOLICIES000.errorCode,
          errorMessage,
        });
        return;
      }


      await passwordPoliciesService.updatePasswordPolicy(passwordPolicy);

      log.info(`${logPrefix} :: Password Policy updated successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: null,
        message: "Password Policy Updated Successfully",
      });
    } catch (error: any) {
      log.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.password_policies.PASSWORDPOLICIES000);
    }
  },

  getPasswordPolicyById: async (req: Request, res: Response): Promise<void> => {
    const logPrefix = `getPasswordPolicyById`;
    try {
      log.info(`${logPrefix} :: Request received`);
      /*
        #swagger.tags = ['Password Policies']
        #swagger.summary = 'Get Password Policy By ID'
        #swagger.description = 'Endpoint to retrieve a Password Policy by ID'
        #swagger.parameters['Authorization'] = {
          in: 'header',
          required: true,
          type: 'string',
          description: 'JWT token for authentication'
        }
        #swagger.parameters['passwordPolicyId'] = {
          in: 'path',
          required: true,
          type: 'string',
          description: 'MongoDB ObjectId of the Password Policy'
        }
      */
  
      const policyId = req.params.passwordPolicyId;
      log.debug(`${logPrefix} :: Parsed parameter :: passwordPolicyId: ${policyId}`);
  
      if (!policyId) {
        log.warn(`${logPrefix} :: Missing passwordPolicyId`);
        res.status(HttpStatusCodes.BAD_REQUEST).send(ErrorCodes.password_policies.PASSWORDPOLICIES002);
        return;
      }
  
      const exists = await passwordPoliciesRepository.existByPasswordPolicyId(policyId);
      if (!exists) {
        log.warn(`${logPrefix} :: No Password Policy found with _id ${policyId}`);
        res.status(HttpStatusCodes.NOT_FOUND).send(ErrorCodes.password_policies.PASSWORDPOLICIES001);
        return;
      }
  
      const passwordPolicy = await passwordPoliciesService.getPasswordPolicyById(policyId);
  
      log.info(`${logPrefix} :: Password Policy fetched successfully`);
      res.status(HttpStatusCodes.OK).send({
        data: passwordPolicy,
        message: "Password Policy Fetched Successfully",
      });
    } catch (error: any) {
      log.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(ErrorCodes.password_policies.PASSWORDPOLICIES000);
    }
  },
};

export default passwordPoliciesController;

