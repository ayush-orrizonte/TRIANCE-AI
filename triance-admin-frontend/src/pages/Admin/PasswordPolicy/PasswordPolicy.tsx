import React, { useEffect, useState } from "react";
import { Switch, Button, TextInput } from "@mantine/core";
import passwordPolicyService from "./passwordPolicyService";
import * as Yup from "yup";
import passwordPolicyValidation from "./passwordPolicyValidation";
import { useLocation } from "react-router-dom";
import { useAuth, useLogger, useToast } from "../../../hooks";
import { LogLevel, MenuAccess, ToastType } from "../../../enums";

const PasswordPolicy: React.FC = () => {
  const { log } = useLogger();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const access = location.state ? location.state.access : MenuAccess.READ;

  const [formValues, setFormValues] = useState({
    id: "",
    passwordExpiry: "",
    passwordHistory: "",
    complexity: "",
    passwordLength: "",
    allowedSpecialCharacters: "",
    invalidAttempts: "",
    alphabetical: false,
    numeric: false,
    specialCharacters: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (name: string, value: string | number | boolean) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const validateForm = async () => {
    try {
      await passwordPolicyValidation.validate(formValues, {
        abortEarly: false,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errorMessages: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errorMessages[err.path] = err.message;
          }
        });
        setErrors(errorMessages);
        return false;
      }
      return false;
    }
  };

  const getPasswordPolicyList = async () => {
    try {
      const response = await passwordPolicyService.getPasswordPolicyList();
      if (
        response.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const policy = response.data.data[0];
        setFormValues({
          id: policy.id || 1,
          passwordExpiry:(policy.password_expiry) || 0,
          passwordHistory:(policy.password_history) || 0,
          complexity:(policy.complexity) || 0,
          passwordLength:(policy.minimum_password_length) || 0,
          allowedSpecialCharacters: policy.allowed_special_characters || "",
          invalidAttempts: (policy.maximum_invalid_attempts) || 0,
          alphabetical: !!policy.alphabetical,
          numeric: !!policy.numeric,
          specialCharacters: !!policy.special_characters,
        });
        setIsUpdating(true);
      }
    } catch (error) {
      log(LogLevel.ERROR, "Error fetching Password Policy List", error);
    }
  };

  const handleSaveChanges = async () => {
    // Optional: uncomment to validate before save
    // const isValid = await validateForm();
    // if (!isValid) return;

    const payload = {
      id: formValues.id,
      password_expiry: Number(formValues.passwordExpiry),
      password_history: Number(formValues.passwordHistory),
      complexity: Number(formValues.complexity),
      minimum_password_length: Number(formValues.passwordLength),
      allowed_special_characters: formValues.allowedSpecialCharacters,
      maximum_invalid_attempts: Number(formValues.invalidAttempts),
      alphabetical: !!formValues.alphabetical,
      numeric: !!formValues.numeric,
      special_characters: !!formValues.specialCharacters,
    };

    console.log("Submitting password policy payload:", payload); // ✅ debug log

    try {
      if (isUpdating) {
        await passwordPolicyService.updatePasswordPolicy(payload);
        showToast("Password Policy Updated", "Success", ToastType.SUCCESS);
      } else {
        await passwordPolicyService.addPasswordPolicy(payload);
        showToast("Password Policy Added", "Success", ToastType.SUCCESS);
      }
      await getPasswordPolicyList();
    } catch (error) {
      log(LogLevel.ERROR, "Error saving Password Policy", error);
    }
  };

  useEffect(() => {
    getPasswordPolicyList();
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col p-4 my-3">
      <h5 className="font-[500] text-2xl ms-6 mb-4">Password Policy</h5>
      <div className="border border-neutral-300 max-w-[90%] w-full sm-max-w-[600px] lg:max-w-[800px] rounded-xl p-4 pb-6 m-6 mt-0">
        <div className="mb-6">
          <TextInput
            type="number"
            disabled={access === MenuAccess.READ}
            label="Password History Count*"
            placeholder="Enter the number of previous passwords to retain"
            value={formValues.passwordHistory}
            onChange={(e) => handleChange("passwordHistory", e.target.value)}
            name="passwordHistory"
            error={errors.passwordHistory}
          />
        </div>
        <div className="mb-6">
          <TextInput
            type="number"
            disabled={access === MenuAccess.READ}
            label="Password Complexity Level*"
            placeholder="Enter the required complexity level"
            value={formValues.complexity}
            onChange={(e) => handleChange("complexity", e.target.value)}
            name="complexity"
            error={errors.complexity}
          />
        </div>
        <div className="mb-6">
          <TextInput
            type="number"
            disabled={access === MenuAccess.READ}
            label="Minimum Password Length*"
            placeholder="Enter the minimum number of characters"
            value={formValues.passwordLength}
            onChange={(e) => handleChange("passwordLength", e.target.value)}
            name="passwordLength"
            error={errors.passwordLength}
          />
        </div>
        <div className="mb-6">
          <TextInput
            type="text"
            disabled={access === MenuAccess.READ}
            label="Allowed Special Characters*"
            placeholder="Enter special characters allowed in passwords"
            value={formValues.allowedSpecialCharacters}
            onChange={(e) =>
              handleChange("allowedSpecialCharacters", e.target.value)
            }
            name="allowedSpecialCharacters"
            error={errors.allowedSpecialCharacters}
          />
        </div>
        <div className="mb-6">
          <TextInput
            type="number"
            disabled={access === MenuAccess.READ}
            label="Maximum Invalid Login Attempts*"
            placeholder="Enter the maximum number of invalid attempts allowed"
            value={formValues.invalidAttempts}
            onChange={(e) => handleChange("invalidAttempts", e.target.value)}
            name="invalidAttempts"
            error={errors.invalidAttempts}
          />
        </div>

        <div className="mb-6 flex justify-between items-center space-x-2">
          <span className="text-sm font-medium">
            Require Alphabetical Characters
          </span>
          <Switch
            disabled={access === MenuAccess.READ}
            checked={formValues.alphabetical}
            onChange={(event) =>
              handleChange("alphabetical", event.currentTarget.checked)
            }
            color="#11B685"
          />
        </div>

        <div className="mb-6 flex justify-between items-center space-x-2">
          <span className="text-sm font-medium">
            Require Numerical Characters
          </span>
          <Switch
            disabled={access === MenuAccess.READ}
            checked={formValues.numeric}
            onChange={(event) =>
              handleChange("numeric", event.currentTarget.checked)
            }
            color="#11B685"
          />
        </div>

        <div className="mb-4 flex justify-between items-center space-x-2">
          <span className="text-sm font-medium">
            Require Special Characters
          </span>
          <Switch
            disabled={access === MenuAccess.READ}
            checked={formValues.specialCharacters}
            onChange={(event) =>
              handleChange("specialCharacters", event.currentTarget.checked)
            }
            color="#11B685"
          />
        </div>

        <Button
          variant="filled"
          color="#5752de"
          fullWidth
          onClick={handleSaveChanges}
        >
          {isUpdating ? "Update Policy" : "Add Policy"}
        </Button>
      </div>
    </div>
  );
};

export default PasswordPolicy;