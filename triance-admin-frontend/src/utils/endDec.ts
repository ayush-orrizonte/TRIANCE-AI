import CryptoJS from 'crypto-js';
import { environment } from '../config/environment';

export const encrypt = (message: string): string => {
    const ciphertext = CryptoJS.AES.encrypt(message, environment.encDecSecretKey).toString();
    return ciphertext;
};

export const decrypt = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, environment.encDecSecretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};