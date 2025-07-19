import React, { useState } from "react";
//import HeaderLogo from "../../../assets/logo.png";
import { Button, TextInput, Title } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import forgotPasswordValidation from "./forgotPasswordValidation";
import { useLogger } from "../../../hooks";
import forgotPasswordService from "./forgotPasswordService";
import { LogLevel } from "../../../enums";
import { encDec } from "../../../utils";
import { useNavigate } from "react-router-dom";


const ForgetPassword: React.FC = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { log } = useLogger();
  const navigate = useNavigate();

  const validationSchema =
    forgotPasswordValidation.validateForgotPassword(isOtpSent);

  const form = useForm({
    initialValues: {
      emailId: "",
      otp: "",
      txnId: "",
    },
    validate: yupResolver(validationSchema),
  });

  const handleSendOtp = async () => {
    try {
    
      const response = await forgotPasswordService.sendOtp(form.values.emailId);
      if (response.data) {
        setIsOtpSent(true);
        form.setFieldValue("txnId", response.data.data.txnId);
        log(LogLevel.INFO, "ForgotLoginPassword :: handleSendOtp", response);
      }
    } catch (error) {
      log(LogLevel.ERROR, "ForgotLoginPassword :: handleSendOtp", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const encryptedOtp = encDec.encrypt(form.values.otp);
      const response = await forgotPasswordService.verifyOtp(
        encryptedOtp,
        form.values.txnId,
      );
     

      if (response.status === 200 && response.data && response.data.data) {
        navigate("/reset-password", {
          state: { txnId: response.data.data.txnId },
        });
        log(LogLevel.INFO, "ForgotLoginPassword :: handleVerifyOtp", response);
      }
    } catch (error) {
      log(LogLevel.ERROR, "ForgotLoginPassword :: handleVerifyOtp", error);
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 forget-password-container flex flex-col items-center justify-center px-5 md:px-0">
     
      <div className="w-[400px] lg:w-[450px] bg-white rounded-[32px] px-5 py-4 flex flex-col items-center shadow-md">
        <div className="mb-10">
          <Title order={2}>Forgot Password</Title>
        </div>
        <form
          onSubmit={form.onSubmit(() => {
            isOtpSent ? handleVerifyOtp() : handleSendOtp();
          })}
          className="w-full"
        >
          <div className="mb-4 text-start">
            <TextInput
              type="email"
              label="Enter email Id"
              placeholder="Enter your email id"
              size="md"
              radius="md"
              classNames={{
                input:
                  "!w-full border  !pl-3 !mt-2 h-10 focus:outline-none focus:border-transparent focus:ring-0 rounded-lg forget-password-input",
                label: "mb-3 text-gray-500",
              }}
              {...form.getInputProps("emailId")}
              onChange={(e) => {
                const value = e.currentTarget.value;
                form.setFieldValue("emailId", value);
               
              }}
            />
          </div>
          {isOtpSent && (
            <div className="mb-4 text-start">
              <TextInput
                type="email"
                label="Enter OTP"
                placeholder="Enter the OTP sent to your emailId id"
                size="md"
                radius="md"
                classNames={{
                  input:
                    "!w-full border !pl-3 !mt-2 h-10 focus:outline-none focus:border-transparent focus:ring-0 rounded-lg forget-password-input",
                  label: "mb-3 text-gray-500",
                }}
                {...form.getInputProps("otp")}
              />
            </div>
          )}
          <Button
            fullWidth
            size="md"
            radius="xl"
            color="red"
            className=" font-[500] text-white rounded-lg py-2 mt-7 forget-password-button"
            onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
          >
            {isOtpSent ? "Verify OTP" : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
