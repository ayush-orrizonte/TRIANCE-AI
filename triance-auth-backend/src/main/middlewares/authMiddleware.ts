import { Response, NextFunction } from "express";
import { PlainToken, Request } from "../types/express";
import { ErrorMessages, HttpStatusCodes, JwtUtils, LoggerUtils, RedisUtils } from "../../main/triance-commons";
import { authConfig } from "../config";

const logger = LoggerUtils.getLogger("authMiddleware");
const redisUtils = RedisUtils.getInstance();

export async function authorize(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logPrefix = `authorize`;
    try {
        const publicRoutes = authConfig.AUTH.API.PUBLIC;
        if (publicRoutes.includes(req.path)) {
            logger.debug(`${logPrefix} :: Bypassing authentication for route :: ${req.path}`);
            return next();
        }

        const authHeader = req.headers["authorization"]; 
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn(`${logPrefix} :: Authorization header missing or invalid`);
            return res.status(HttpStatusCodes.UNAUTHORIZED).send({
                code: HttpStatusCodes.UNAUTHORIZED,
                message: ErrorMessages.UNAUTHORIZED,
            });
        }

        const token = authHeader.split(" ")[1];
        let decodedToken: PlainToken;

        try {
            decodedToken = JwtUtils.verifyJwt(token) as PlainToken;
            const cachedToken = await redisUtils.get(decodedToken.email);

            if (!cachedToken || cachedToken != token) return res.status(HttpStatusCodes.UNAUTHORIZED).send({
                code: HttpStatusCodes.UNAUTHORIZED,
                message: ErrorMessages.UNAUTHORIZED,
            });
        } catch (error) {
            logger.warn(`${logPrefix} :: Invalid or expired token :: error :: ${error.message}`);
            return res.status(HttpStatusCodes.FORBIDDEN).send({
                code: HttpStatusCodes.FORBIDDEN,
                message: ErrorMessages.FORBIDDEN,
            });
        }

        req.plainToken = decodedToken;
        next();
    } catch (error) {
        logger.error(`${logPrefix} :: Error validating token :: error :: ${error.message}`);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
            code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: ErrorMessages.INTERNAL_SERVER_ERROR,
        });
    }
}
