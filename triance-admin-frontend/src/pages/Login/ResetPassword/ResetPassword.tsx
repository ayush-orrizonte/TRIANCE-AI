import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Button, PasswordInput, Stack, Title } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import resetPasswordValidation from "./resetPasswordValidation";
import resetPasswordService from "./resetPasswordService";
import { encDec } from "../../../utils";
import { useLogger, useToast } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { LogLevel, ToastType } from "../../../enums";

const ResetPassword: React.FC = () => {
  const [visible, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const { log } = useLogger();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const txnId = location.state?.txnId || "";

  const validationSchema = resetPasswordValidation.validateResetPassword();
  const form = useForm({
    initialValues: {
      txnId: txnId,
      newPassword: "",
      confirmPassword: "",
    },
    validate: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (location.state?.txnId) {
      form.setFieldValue("txnId", location.state.txnId);
    }
  }, [location.state]);

  const handleResetPassword = async (values: {
    txnId: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const encryptedNewPassword = encDec.encrypt(values.newPassword);
      const encryptedConfirmPassword = encDec.encrypt(values.confirmPassword);

      const response = await resetPasswordService.resetPassword(
        values.txnId,
        encryptedNewPassword,
        encryptedConfirmPassword
      );

      if (response.status === 200) {
        showToast("User Created Successfully", "Success", ToastType.SUCCESS);
        form.reset();
        log(LogLevel.INFO, "ForgotLoginPassword :: handleVerifyOtp", response);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Error resetting password", error);
    }
  };
  return (
    <div className="w-full min-h-screen pt-20 forget-password-container flex flex-col items-center justify-center px-5 md:px-0">
     
      <div className="w-[400px] lg:w-[450px] bg-white rounded-[32px] px-5 py-4 flex flex-col items-center shadow-md">
        <div className="mb-8">
          <Title order={2}>Reset Password</Title>
        </div>

        <form className="w-full" onSubmit={form.onSubmit(handleResetPassword)}>
          <div className="space-y-4 w-full">
            <div className="mb-4 text-start relative">
              <Stack>
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new password"
                  size="md"
                  radius="md"
                  value={form.values.newPassword}
                  {...form.getInputProps("newPassword")}
                  error={form.errors.newPassword}
                  classNames={{
                    input:
                      "!w-full border bg-[#F0F0F0] pl-3 mt-2 h-10 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 rounded-lg",
                    label: "mb-1 ml-3 mt-2 text-gray-500 text-start",
                  }}
                />
              </Stack>
            </div>

            <div className="mb-4 text-start relative">
              <Stack>
                <PasswordInput
                  label="Confirm Password"
                  visible={visible}
                  onVisibilityChange={toggle}
                  placeholder="Confirm your new password"
                  size="md"
                  radius="md"
                  {...form.getInputProps("confirmPassword")}
                  error={form.errors.confirmPassword}
                  classNames={{
                    input:
                      "!w-full border bg-[#F0F0F0] pl-3 mt-2 h-10 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 rounded-lg",
                    label: "mb-1 ml-3 mt-2 text-gray-500 text-start",
                  }}
                />
              </Stack>
            </div>
          </div>

          <div className="w-full">
            <Button
              fullWidth
              size="md"
              radius="xl"
              color="red"
              className="reset-password-button font-[500] text-white rounded-lg py-2 mt-7"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
