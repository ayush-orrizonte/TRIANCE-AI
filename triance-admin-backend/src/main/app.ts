import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import routes from "./startup/routes";
import {
  LoggerUtils,HttpStatusCodes,
  MongoDBUtils,
  RedisUtils,
  ErrorMessages,
} from "../main/triance-commons";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger/swagger.json";
import { environment } from "./config/environment";
import { authorize } from "./middlewares";

dotenv.config();

const app: Express = express();
const logger = LoggerUtils.getLogger("app");
const mongoDBUtils = MongoDBUtils.getInstance();
const redisUtils = RedisUtils.getInstance();

const resolveCrossDomain = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader("Access-Control-Allow-Origin", environment.allowedOrigins);
  res.header("Access-Control-Allow-Methods", environment.allowedMethods);
  res.header("Access-Control-Allow-Headers", environment.allowedHeaders);
  res.header("Access-Control-Expose-Headers", "Version");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Strict-Transport-Security", "max-age=15552000");
  if ("OPTIONS" == req.method) {
    res.send(HttpStatusCodes.OK);
  } else {
    next();
  }
};

app.use(resolveCrossDomain);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
  })
);

//CSP Header

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; worker-src 'self' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
//   );
//   next();
// });

app.use(cors({ origin: environment.allowedOrigins, credentials: true }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "deny" }));
app.use(compression());
app.use(express.json({ limit: environment.jsonLimit }));
app.use(express.urlencoded({ limit: "500kb", extended: true }));
app.set("view engine", "ejs");
app.use(function applyXFrame(req: Request, res: Response, next: NextFunction) {
  res.set("X-Frame-Options", environment.xFrameOptions);
  next();
});

app.use(
  fileUpload({
    limits: { fileSize: environment.allowedFileUploadSize },
  })
);

app.use("/api/v1/admin/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use((_req: Request, res: Response, _next: NextFunction) => {
  authorize(_req, res, _next);
});

routes(app);

app.use((_req: Request, res: Response) => {
  res.status(HttpStatusCodes.NOT_FOUND).send({
    message: ErrorMessages.NOT_FOUND,
    code: HttpStatusCodes.NOT_FOUND,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
    message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR,
    code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
  });
});

const startServer = async () => {
  try {
    await mongoDBUtils.connect();
    await redisUtils.connect();

    app.listen(environment.port, () => {
      logger.info(`Server Started :: Listening to port [${environment.port}]`);
    });
  } catch (error) {
    logger.error(
      `Error during server initialization :: error :: ${error}`
    );
    process.exit(1);
  }
};

startServer();
