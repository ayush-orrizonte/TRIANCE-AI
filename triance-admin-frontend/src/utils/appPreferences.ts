import { environment } from "../config/environment";

const setItem = (key: string, value: string): Promise<void> => {
    key = getPrefix() + key;
    return new Promise((resolve, reject) => {
        try {
            if (environment.useLocalStorage) {
                localStorage.setItem(key, value);
            } else {
                sessionStorage.setItem(key, value);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const getItem = (key: string): Promise<string | null> => {
    key = getPrefix() + key;
    return new Promise((resolve, reject) => {
        try {
            const item = environment.useLocalStorage ? localStorage.getItem(key) : sessionStorage.getItem(key);
            resolve(item);
        } catch (error) {
            reject(error);
        }
    });
};

const removeItem = (key: string): Promise<void> => {
    key = getPrefix() + key;
    return new Promise((resolve, reject) => {
        try {
            if (environment.useLocalStorage) {
                localStorage.removeItem(key);
            } else {
                sessionStorage.removeItem(key);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const clearItems = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (environment.useLocalStorage) {
                localStorage.clear();
            } else {
                sessionStorage.clear();
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const getPrefix = () => environment.appPreferencesPrefix;

export { setItem, getItem, removeItem, clearItems };
