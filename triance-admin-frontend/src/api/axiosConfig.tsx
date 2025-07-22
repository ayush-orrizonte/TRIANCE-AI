import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { LogLevel, ToastType } from "../enums";

import {
  isMobile,
  isTablet,
  osName,
  isDesktop,
  browserVersion,
  browserName,
  deviceType,
  osVersion,
} from "react-device-detect";
import { environment } from "../config/environment";

const api: AxiosInstance = axios.create({
  timeout: 10000,
});

const appendDeviceInfoInRequestHeaders = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  if (config.headers) {
    config.headers["uo-device-type"] = deviceType;
    config.headers["uo-os"] = osName;
    config.headers["uo-os-version"] = osVersion;
    config.headers["uo-is-mobile"] = isMobile;
    config.headers["uo-is-tablet"] = isTablet;
    config.headers["uo-is-desktop"] = isDesktop;
    config.headers["uo-browser"] = browserName;
    config.headers["uo-browser-version"] = browserVersion;
  }
  return config;
};

const setupInterceptors = (
  userToken: string,
  logout: () => void,
  showLoader: () => void,
  hideLoader: () => void,
  showToast: (
    message: string,
    title?: string,
    type?: ToastType,
    autoClose?: number
  ) => void,
  log: (level: LogLevel, message: string, ...args: any[]) => void
) => {
  api.interceptors.request.use(
    async (config) => {
      const shouldIgnoreLoader = environment.skipLoaderRoutes.some(
        (route: string) => config.url?.startsWith(route)
      );
      if (!shouldIgnoreLoader) {
        showLoader();
      }

      if (config.url?.startsWith("/api/v1/auth")) {
        config.baseURL = environment.authApiBaseUrl;
        console.log(config.baseURL);
      } else if (config.url?.startsWith("/api/v1/user")) {
        config.baseURL = environment.userApiBaseUrl;
      } else if (config.url?.startsWith("/api/v1/admin")) {
        config.baseURL = environment.adminApiBaseUrl;
      } else if (config.url?.startsWith("/api/v1/devotee")) {
        config.baseURL = environment.devoteeApiUrl;
      }

      if (userToken) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = userToken;
      }

      config = appendDeviceInfoInRequestHeaders(config);

      return config;
    },
    (error) => {
      hideLoader();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response: AxiosResponse) => {
      hideLoader();
      log(LogLevel.DEBUG, "api", response);
      return response;
    },
    (error: any) => {
      log(LogLevel.ERROR, "api", error);
      hideLoader();
      if (error.response && error.response.data) {
        if (
          error.response.status === 401 &&
          error.config.url !== "/api/v1/auth/admin/logout"
        ) {
          logout();
          showToast("Session Timed Out", "Error", ToastType.ERROR);
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        } else {
          const errorMessage =
            error.response.data.message ||
            error.response.data.errorMessage ||
            "An error occurred";
          showToast(errorMessage, "Error", ToastType.ERROR);
          if (error.response.data.errorCode === "AUTH00002") {
            setTimeout(() => {
              window.location.href = "/forgot-password";
            }, 1000);
          }
        }
      }
    }
  );
};

export default api;
export { setupInterceptors };
