import * as Yup from "yup";

const forgotPasswordValidation = {
  validateForgotPassword: (otpSent: boolean) => {
    return Yup.object().shape({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      otp: otpSent
        ? Yup.string()
            .matches(/^\d{6}$/, "Invalid OTP")
            .required("OTP is required")
        : Yup.string().notRequired(),
      txnId: otpSent
        ? Yup.string().required("Transaction ID is required")
        : Yup.string().notRequired(),
    });
  },
};

export default forgotPasswordValidation;
