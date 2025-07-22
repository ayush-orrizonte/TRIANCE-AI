import * as Yup from "yup";

export const loginValidations = {
  validateLoginWithPassword: () => {
    return Yup.object().shape({
      email_id: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    });
  },
};
