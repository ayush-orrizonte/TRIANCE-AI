import { createLogger, format, transports, Logger } from "winston";
import moment from "moment";
import EnvUtils from "../config/envUtils";  

export class LoggerUtils {
    private static moduleName: string = EnvUtils.getStringEnvVariableOrDefault("MODULE", "app");

    private static tsFormat() {
        return moment()
            .utcOffset("330")
            .format("YYYY-MM-DD hh:mm:ss")
            .trim();
    }

    private static options = {
        errorFile: {
            level: "error",
            timestamp: LoggerUtils.tsFormat,
            filename: `./logs/${LoggerUtils.moduleName}-error.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 2,
            colorize: false
        },
        console: {
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true
        }
    };

    private static myFormat = format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}] :: ${label} :: ${message}`;
    });

    static getLogger(serviceName: string): Logger {
        const logLevel = EnvUtils.getStringEnvVariableOrDefault("LOG_LEVEL", "error");

        const transportsArray: any[] = [
            logLevel === 'error' && new transports.File({
                ...this.options.errorFile,
                filename: `./logs/${LoggerUtils.moduleName}-${serviceName}-error.log`
            }),
            new transports.Console({
                ...this.options.console,
                level: logLevel,
                format: format.combine(
                    format.colorize(),
                )
            })
        ];

        const filteredTransports = transportsArray.filter(Boolean);

        return createLogger({
            format: format.combine(
                format.label({ label: serviceName }),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                this.myFormat
            ),
            transports: filteredTransports,
            exitOnError: false
        });
    }

    static stream = {
        write: function (message: string, encoding: string) {
            LoggerUtils.getLogger("event").info("FROM EVENT " + message);
        }
    };
}

export default LoggerUtils;
