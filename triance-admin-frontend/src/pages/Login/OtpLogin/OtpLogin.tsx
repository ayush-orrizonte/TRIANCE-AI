import React, { useState } from "react";
//import HeaderLogo from "../../../assets/logo.png";
import { TextInput, Title, Button } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { otpLoginValidation } from "./otpLoginValidation";
import { LoginOtpService } from "./otpLoginService";
import { useAuth, useLogger, useToast } from "../../../hooks";
import { LogLevel, ToastType } from "../../../enums";
import { encDec } from "../../../utils";

const OtpLogin: React.FC = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
 // const [mobileNumber, setMobileNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const { showToast } = useToast();
  const { log } = useLogger();
  const { setUserTokenToContext, login } = useAuth();

  const validationSchema = otpLoginValidation.otpLogin(otpSent);

  const form = useForm({
    initialValues: {
      mobileNumber: "",
      otp: "",
      txnId: "",
    },
    validate: yupResolver(validationSchema),
  });

  const handleSendOtp = async () => {
    try {
      const response = await LoginOtpService.sendOtp(form.values.mobileNumber);
      if (response?.data) {
        setOtpSent(true);
        setShowOtpInput(true);
        form.setFieldValue("txnId", response.data.data.txnId);
        showToast("OTP sent successfully", "Success", ToastType.SUCCESS);
      } else {
        showToast(ToastType.ERROR, "Failed to send OTP");
      }
    } catch (error) {
      log(LogLevel.ERROR, "Login :: handleSendOtp error", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const encryptedOtp = encDec.encrypt(form.values.otp);
      const response = await LoginOtpService.verifyOtp(
        encryptedOtp,
        form.values.txnId
      );
      if (response.data && response.data.data) {
        log(LogLevel.INFO, "Login :: handleVerifyOtp", response);
        await login();
        setUserTokenToContext(response.data.data.token);
      } else {
        showToast(ToastType.ERROR, "OTP verification failed");
      }
    } catch (error) {
      log(LogLevel.ERROR, "Login :: handleVerifyOtp error", error);
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 bg-[#FFF2E9] flex justify-center items-center px-5 md:px-0">
      <div className="w-[400px] lg:w-[450px] bg-white rounded-[32px] px-5 py-4">
        <div className="flex justify-center">
      
        </div>
        <form onSubmit={form.onSubmit(() => {})}>
          <div className="text-center">
            <Title className="text-2xl font-bold" order={2}>
              {showOtpInput ? "Enter OTP" : "Verify your mobile number"}
            </Title>
            {!showOtpInput && (
              <p className="text-sm text-center mt-5">
                You will receive a 6-digit code for phone number verification
              </p>
            )}
          </div>

          {!showOtpInput ? (
            <div className="mt-4 w-full">
              <TextInput
                type="tel"
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={form.values.mobileNumber}
                name="mobileNumber"
                key={form.key("mobileNumber")}
                error={form.errors.mobileNumber}
                {...form.getInputProps("mobileNumber")}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    form.setFieldValue("mobileNumber", value);
                  }
                }}
                size="md"
                radius="lg"
                classNames={{
                  input:
                    "!w-full border bg-[#F0F0F0] !pl-3 !mt-2 h-10 rounded-lg using-otp-login-input focus:outline-none focus:border-transparent focus:ring-0",
                  label: "mb-1 !ml-3 mt-2 text-gray-500 text-start ",
                }}
              />
              <div className="w-full">
                <Button
                  fullWidth
                  type="submit"
                  radius="xl"
                  size="md"
                  color="red"
                  className="  font-[500] text-white w-full rounded-lg py-2 mt-7 using-otp-login"
                  onClick={handleSendOtp}
                >
                  Send OTP
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <TextInput
                type="tel"
                label="OTP"
                placeholder="Enter 6-digit OTP"
                value={otp}
                name="otp"
                size="md"
                radius="md"
                key={form.key("otp")}
                error={form.errors.otp}
                {...form.getInputProps("otp")}
                classNames={{
                  input:
                    "!w-full border  !pl-3 !mt-2 h-10 focus:outline-none focus:border-transparent focus:ring-0 rounded-lg verify-otp-label",
                  label: "mb-3 !ml-3 mt-2 text-gray-500 text-start ",
                }}
              />
              <div>
                <Button
                  fullWidth
                  radius="xl"
                  size="md"
                  type="submit"
                  color="red"
                  className=" font-[500] text-white w-full rounded-lg py-2 mt-7 verfity-otp-button"
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  {otpSent ? "Verify" : "Send OTP"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OtpLogin;
