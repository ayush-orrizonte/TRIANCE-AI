import * as Yup from "yup";

const passwordPolicyValidation = Yup.object().shape({
  passwordExpiry: Yup.number()
    .positive("Password expiry must be a positive number")
    .integer("Password expiry must be an integer")
    .required("Password expiry is required"),
  
  passwordHistory: Yup.number()
    .positive("Password history must be a positive number")
    .integer("Password history must be an integer")
    .required("Password history is required"),
  
  complexity: Yup.number()
    .min(1, "Complexity level must be at least 1")
    .max(5, "Complexity level must not exceed 5")
    .required("Complexity level is required"),
  
  passwordLength: Yup.number()
    .min(8, "Minimum password length must be at least 8 characters")
    .max(64, "Minimum password length must not exceed 64 characters")
    .required("Minimum password length is required"),
  
  allowedSpecialCharacters: Yup.string()
    .matches(/^[!@#$%^&*(),.?":{}|<>]*$/, "Allowed special characters must only include standard special symbols")
    .required("Allowed special characters is required"),
  
  invalidAttempts: Yup.number()
    .positive("Maximum invalid attempts must be a positive number")
    .integer("Maximum invalid attempts must be an integer")
    .required("Maximum invalid attempts is required"),
  
  alphabetical: Yup.boolean().required("Alphabetical requirement must be specified"),
  
  numeric: Yup.boolean().required("Numeric requirement must be specified"),
  
  specialCharacters: Yup.boolean().required("Special characters requirement must be specified"),
});

export default passwordPolicyValidation;
