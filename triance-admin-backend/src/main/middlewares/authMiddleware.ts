import { Response, NextFunction } from "express";
import { PlainToken, Request } from "../types/express";
import {
  ErrorMessages,
  HttpStatusCodes,
  JwtUtils,
  LoggerUtils,
  RedisUtils,
} from "../triance-commons";
import {authConfig} from "../config";
const logger = LoggerUtils.getLogger("authMiddleware");
const redisUtils = RedisUtils.getInstance();

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const logPrefix = `authorize`;

  try {
    logger.info(`${logPrefix} :: Request received`);

    const publicRoutes = authConfig.AUTH.API.PUBLIC;
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));

    if (isPublicRoute) {
      logger.debug(`${logPrefix} :: Public route :: ${req.path} :: Bypassing authentication`);
      next();
      return;
    }

    const authHeader = req.headers["authorization"];
        let token: string | undefined;

        if (!authHeader) {
            logger.warn(`${logPrefix} :: Missing Authorization header`);
            res.status(HttpStatusCodes.UNAUTHORIZED).send({
                code: HttpStatusCodes.UNAUTHORIZED,
                message: ErrorMessages.UNAUTHORIZED,
            });
            return;
        } else if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            token = authHeader;
            logger.warn(`${logPrefix} :: Authorization header does not use the 'Bearer' scheme. This is not recommended.`);
        }

        if (!token) {
            logger.warn(`${logPrefix} :: Missing token from Authorization header`);
            res.status(HttpStatusCodes.UNAUTHORIZED).send({
                code: HttpStatusCodes.UNAUTHORIZED,
                message: ErrorMessages.UNAUTHORIZED,
            });
            return;
        }
    try {
      const decodedToken = JwtUtils.verifyJwt(token) as PlainToken;
      const cachedToken = await redisUtils.get(decodedToken.email);

      if (!cachedToken || cachedToken !== token) {
        logger.warn(`${logPrefix} :: Token mismatch or not found in cache for ${decodedToken.email}`);
        res.status(HttpStatusCodes.UNAUTHORIZED).send({
          code: HttpStatusCodes.UNAUTHORIZED,
          message: ErrorMessages.UNAUTHORIZED,
        });
        return;
      }

      req.plainToken = decodedToken;
      logger.info(`${logPrefix} :: Token verified for :: ${decodedToken.email}`);
      next();
    } catch (error: any) {
      logger.warn(`${logPrefix} :: Token verification failed :: ${error.message}`);
      res.status(HttpStatusCodes.FORBIDDEN).send({
        code: HttpStatusCodes.FORBIDDEN,
        message: ErrorMessages.FORBIDDEN,
      });
    }
  } catch (error: any) {
    logger.error(`${logPrefix} :: Internal error :: ${error.message} :: ${error}`);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
}
