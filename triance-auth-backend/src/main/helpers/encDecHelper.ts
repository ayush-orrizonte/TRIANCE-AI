import CryptoJS from "crypto-js";
import { environment } from "../config";

const decryptPayload = function (reqData: string): string {
    if (reqData) {
        let bytes = CryptoJS.AES.decrypt(reqData, environment.cryptoEncryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } else {
        return "";
    }
};

export { decryptPayload }