import * as Yup from "yup";

const addOrUpdateUserValidation = {
  validateAddOrUpdateUser: () => {
    return Yup.object().shape({
      first_name: Yup.string()
        .min(3, "First Name must be at least 3 characters")
        .max(30, "First Name must not exceed 30 characters")
        .matches(
          /^[a-zA-Z\s]*$/,
          "First Name can only contain letters and spaces"
        )
        .required("First Name is required"),

      last_name: Yup.string()
        .min(2, "Last Name must be at least 2 characters")
        .max(30, "Last Name must not exceed 50 characters")
        .matches(
          /^[a-zA-Z\s]*$/,
          "Last Name can only contain letters and spaces"
        )
        .required("Last Name is required"),

      email_id: Yup.string()
        .required("Email is required")
        .matches(/\S+@\S+\.\S+/, "Enter valid email"),

      mobile_number: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Invalid mobile number")
        .required("Mobile Number is required"),

      role_id: Yup.number()
        .transform((value, originalValue) =>
          String(originalValue).trim() === "" ? NaN : value
        )
        .typeError("Role is required")
        .required("Role is required"),
    });
  },
};

export default addOrUpdateUserValidation;
