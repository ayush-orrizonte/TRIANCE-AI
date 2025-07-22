import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import routes from "./startup/routes";
import {
  LoggerUtils,
  HttpStatusCodes,
  MongoDBUtils,
  RedisUtils,
  ErrorMessages,
} from "../main/triance-commons";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger/swagger.json";
import { environment } from "./config";
import process from "node:process";

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
  if (req.method === "OPTIONS") {
    res.sendStatus(HttpStatusCodes.OK);
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

app.use(cors({ origin: environment.allowedOrigins, credentials: true }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "deny" }));
app.use(compression());
app.use(express.json({ limit: environment.jsonLimit }));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("X-Frame-Options", environment.xFrameOptions);
  next();
});

app.use(
  fileUpload({
    limits: { fileSize: environment.allowedFileUploadSize },
  })
);

app.use("/api/v1/auth/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
    const redisUtils = RedisUtils.getInstance();
    try {
      await redisUtils.connect();
      logger.info('Redis connection established');
      app.get('/health', async (req, res) => {
        try {
          await redisUtils.ensureConnection();
          res.json({ 
            status: 'healthy',
            redis: 'connected',
            mongo: 'connected'
          });
        } catch (error) {
          res.status(500).json({
            status: 'degraded',
            redis: 'disconnected',
            mongo: 'connected',
            error: error.message
          });
        }
      });
    } catch (error) {
      logger.error(`Redis connection failed: ${error.message}`);
      app.get('/health', (req, res) => {
        res.status(500).json({
          status: 'degraded',
          redis: 'disconnected',
          mongo: 'connected'
        });
      });
    }

    app.listen(environment.port, () => {
      logger.info(`Server Started :: Listening on port [${environment.port}]`);
    });
  } catch (error) {
    logger.error(
      `Error during server initialization :: error :: ${error.message} :: ${error}`
    );
    process.exit(1);
  }
};

startServer();
