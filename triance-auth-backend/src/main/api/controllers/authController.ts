import { Request, Response } from "express";
import { HttpStatusCodes } from "../../triance-commons";

const authController = {
    healthCheck: (req: Request, res: Response): void => {
        /*
            #swagger.tags = ['Auth']
            #swagger.summary = 'Health Check'
            #swagger.description = 'Endpoint to Health Check'
        */
        res.status(HttpStatusCodes.OK).send({
            data: null,
            message: "Auth Service is Up and Running!",
        });
    },
};

export default authController;
