import jwt from "jsonwebtoken";
import { EnvUtils } from "../config";
import { CacheTTL } from "../enums";

export class JwtUtils {
    private static secret: string = EnvUtils.getString("JWT_SECRET");

    public static generateJwt(payload: any, expiresIn: string): string {
        return jwt.sign(payload, JwtUtils.secret, { expiresIn });
    }

    public static verifyJwt(token: string): any {
        try {
            return jwt.verify(token, JwtUtils.secret);
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }

    public static getSecret(): string {
        return JwtUtils.secret;
    }
}
