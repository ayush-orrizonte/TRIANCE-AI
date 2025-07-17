import { Response } from "express";
import { Request } from "../../types/express";
import { LoggerUtils, HttpStatusCodes, EnvUtils } from "../../triance-commons";
import { UploadedFile } from "express-fileupload";
import { ErrorCodes } from "../../enums";


const logger = LoggerUtils.getLogger("adminController");

const adminController = {
  health: (req: Request, res: Response): void => {
    /*  
                #swagger.tags = ['Admin']
                #swagger.summary = 'Health Check API'
                #swagger.description = 'Endpoint to health check Admin Service'
        */
    res.status(HttpStatusCodes.OK).send({
      data: null,
      message: "Admin Service is Up and Running!",
    });
  },
  

  };

export default adminController;