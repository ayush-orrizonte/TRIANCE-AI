import * as Yup from "yup";

const addOrUpdateUserValidation = {
  validateAddOrUpdateUser: () => {
    return Yup.object().shape({
      admin_name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must not exceed 50 characters")
        .matches(
          /^[a-zA-Z\s]*$/,
          "Name can only contain letters and spaces"
        )
        .required("Name is required"),

      admin_email: Yup.string()
        .required("Email is required")
        .matches(/\S+@\S+\.\S+/, "Enter valid email")
        .max(100, "Email must not exceed 100 characters"),

      admin_id: Yup.number()
        .typeError("Admin ID must be a number")
        .positive("Admin ID must be positive")
        .integer("Admin ID must be an integer"),

      role_id: Yup.number()
        .transform((value, originalValue) => 
          String(originalValue).trim() === "" ? NaN : value
        )
        .typeError("Role is required")
        .required("Role is required")
        .positive("Role ID must be positive")
        .integer("Role ID must be an integer"),

      level: Yup.string()
        .required("Level is required")
        .oneOf(
          ['super', 'admin', 'user'], 
          "Level must be either 'super', 'admin', or 'user'"
        )
    });
  },
};

export default addOrUpdateUserValidation;