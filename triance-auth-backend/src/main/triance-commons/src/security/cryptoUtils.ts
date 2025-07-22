import crypto from "crypto";
import EnvUtils from "../config/envUtils";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";

export class CryptoUtils {
    private static encryptionKey: Buffer;

    // Static initialization with fallback key
    static {
        const key = EnvUtils.getStringEnvVariable("ENCRYPTION_KEY");
        if (!key) {
            console.warn(
                "⚠️ ENCRYPTION_KEY is not set. Using insecure default key (development mode)."
            );
        }

        const finalKey = (key && key.length === 32)
            ? key
            : "default-insecure-32-char-key-123456"; // Must be 32 chars

        if (key && key.length !== 32) {
            console.warn(
                `⚠️ ENCRYPTION_KEY length is ${key.length}. Expected 32 characters for AES-256. Using fallback key.`
            );
        }

        CryptoUtils.encryptionKey = Buffer.from(finalKey, "utf-8");
    }

    /**
     * Encrypt a string using AES-256-CBC
     * @param text Plain text
     * @returns Encrypted text in the format iv:encryptedData
     */
    public static encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            ENCRYPTION_ALGORITHM,
            CryptoUtils.encryptionKey,
            iv
        );
        let encrypted = cipher.update(text, "utf-8");
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
    }

    /**
     * Decrypt a string using AES-256-CBC
     * @param text Encrypted text in format iv:encryptedData
     * @returns Decrypted plain text
     */
    public static decrypt(text: string): string {
        const parts = text.split(":");
        if (parts.length < 2) {
            throw new Error("Invalid encrypted text format.");
        }

        const iv = Buffer.from(parts.shift() || "", "hex");
        const encryptedText = Buffer.from(parts.join(":"), "hex");

        const decipher = crypto.createDecipheriv(
            ENCRYPTION_ALGORITHM,
            CryptoUtils.encryptionKey,
            iv
        );
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString("utf-8");
    }
}
