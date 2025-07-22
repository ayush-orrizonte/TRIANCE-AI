import { useForm, yupResolver } from "@mantine/form";
import React, { useState } from "react";
import { loginValidations } from "./loginValidations";

import { useNavigate } from "react-router-dom";
import { useAuth, useLogger, useToast } from "../../hooks";
import { encDec } from "../../utils";
import { LogLevel, ToastType } from "../../enums";
import { loginService } from "./loginService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { log } = useLogger();
  const { setUserTokenToContext, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validationSchema = loginValidations.validateLoginWithPassword();

  const form = useForm({
    initialValues: {
      email_id: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const handleLogin = async (values: {
    email_id: string;
    password: string;
  }) => {
    try {
      const encryptedPassword = encDec.encrypt(values.password);
      const response = await loginService.loginWithPassword(
        values.email_id,
        values.password 
      );

      if (response.data && response.data.data) {
        await login();
        setUserTokenToContext(response.data.data.token);
        showToast("Login Successful", "Success", ToastType.SUCCESS);
      }

      log(LogLevel.INFO, "Login :: handleLogin", response);
    } catch (error) {
      log(LogLevel.ERROR, "Login :: handleLogin", error);
    }
  };

  const handleLoginWithOtp = () => {
    navigate("/otp-login");
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  return (
    <div className="w-full min-h-screen pt-20 login-page-main-container flex justify-center items-center px-5 md:px-0 ">
      <div className="w-[400px] lg:w-[450px] bg-white shadow-md rounded-[32px] px-5 py-4">
        <h1 className="text-[#5752de] font-bold text-3xl sm:text-4xl text-center mt-10 mb-10">
          Admin Login
        </h1>
        <p className="text-[#404040] font-[500] text-lg sm:text-xl text-center">
          Login to your Admin Account
        </p>
        <form onSubmit={form.onSubmit(handleLogin)}>
          <div className="mt-10 mb-2 flex flex-col justify-center items-center space-y-4">
            <div className="w-full sm:w-3/4">
              <input
                id="email_id"
                type="text"
                className="border  py-3 px-4 text-sm w-full bg-[#F0F0F0] rounded-3xl outline-none"
                error={form.errors.email_id}
                {...form.getInputProps("email_id")}
                placeholder="Enter your email id"
              />
              {form.errors.email_id && (
                <p className="text-red-600 font-[500] text-xs mt-1">
                  {form.errors.email_id}
                </p>
              )}
            </div>
            <div className="relative w-full sm:w-3/4">
              <input
                id="password"
                maxLength={25}
                type={showPassword ? "text" : "password"}
                className="border w-full py-3 px-4 text-sm  bg-[#F0F0F0] rounded-3xl outline-none"
                error={form.errors.password}
                {...form.getInputProps("password")}
                placeholder="Password"
              />
              {showPassword ? (
                <FontAwesomeIcon
                  icon={faEyeSlash}
                  className="absolute top-4 right-4 cursor-pointer"
                  color="#5752de"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faEye}
                  className="absolute top-4 right-4 cursor-pointer"
                  color="#5752de"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}

              {form.errors.password && (
                <p className="text-red-600 font-[500] text-xs mt-1">
                  {form.errors.password}
                </p>
              )}
            </div>

            <div className="w-full sm:w-3/4 flex justify-end items-center">
              <div
                className="flex items-center space-x-1 cursor-pointer"
                onClick={handleForgotPassword}
              >
                <FontAwesomeIcon
                  color="#5752de"
                  icon={faLock}
                  className="relative top-[1px]"
                />
                <p className="text-xs font-[500] text-[#5752de]">
                  Forgot Password
                </p>
              </div>
            </div>
            <div className="w-full sm:w-3/4">
              <button
                type="submit"
                className="bg-[#5752de] font-[500] text-white w-full rounded-lg py-2"
              >
                Sign In
              </button>
            </div>

            {/* <div className="w-full sm:w-3/4 flex items-center font-[600] text-[#A6A6A6] text-sm">
              <hr className="flex-grow border-[#A6A6A6]" />
              <span className="mx-4 text-gray-500">OR</span>
              <hr className="flex-grow border-[#A6A6A6]" />
            </div>
            <div className="w-full sm:w-3/4 mb-5">
              <button
                className="bg-transparent border border-[#5752de] font-[500] text-[#5752de] w-full rounded-lg py-2"
                onClick={handleLoginWithOtp}
              >
                Login Using OTP
              </button>
            </div> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
