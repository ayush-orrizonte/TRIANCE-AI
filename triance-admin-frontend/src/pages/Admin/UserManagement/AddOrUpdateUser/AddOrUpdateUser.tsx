import React, { useEffect, useState } from "react";
import { TextInput, Button } from "@mantine/core";
import usersListService from "../UserList/usersListService";
import { useForm, yupResolver } from "@mantine/form";
import addOrUpdateUserValidation from "./addOrUpdateUserValidations";
import DropDown from "../../../../components/common/DropDown/DropDown";
import { useLogger, useToast } from "../../../../hooks";
import { LogLevel, ToastType } from "../../../../enums";
import { AddOrUpdateUserProps } from "./addOrUpdateUserTypes";

const AddOrUpdateUser: React.FC<AddOrUpdateUserProps> = ({
  user_id,
  close,
}) => {
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { log } = useLogger();
  const { showToast } = useToast();

  // Gender options for the dropdown
  const genders = [
    { label: "Select Gender", value: "" },
    { label: "Male", value: "1" },
    { label: "Female", value: "2" },
    { label: "Other", value: "3" },
  ];

  // Form configuration
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email_id: "",
      mobile_number: "",
      role_id: "",
      gender: "",
    },
    validate: yupResolver(addOrUpdateUserValidation.validateAddOrUpdateUser()),
  });

  // Fetch roles for the dropdown
//   const listRoles = async () => {
//     try {
//       const response = await usersListService.listRoles(50, 1, true);
//       log(LogLevel.INFO, "Roles :: listRoles", response);
//       if (response.data && response.data.data) {
//         const transformedRoles = [
//           { label: "Select Role", value: "" },
//           ...response.data.data.rolesList.map(
//             (role: { role_name: string; role_id: number }) => ({
//               label: role.role_name,
//               value: role.role_id.toString(),
//             })
//           ),
//         ];
//         setRoles(transformedRoles);
//       }
//     } catch (error) {
//       log(LogLevel.ERROR, "Roles :: listRoles", error);
//       showToast(
//         "Failed to load roles. Please try again later.",
//         "Error",
//         ToastType.ERROR
//       );
//     }
//   };

  // const handleAddUserClick = async () => {
  //   const errors = form.validate();
  //   if (Object.keys(errors.errors).length > 0) {
  //     showToast(
  //       "Please fix the validation errors.",
  //       "Validation Error",
  //       ToastType.WARNING
  //     );
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const values = form.values;
  //     const response = await usersListService.addUser(
  //       values.first_name,
  //       values.last_name,
  //       values.mobile_number,
  //       values.email_id,
  //       parseInt(values.role_id)

  //     );
  //     log(LogLevel.INFO, "User :: Add User", response);
  //     if (response.status === 200) {
  //       showToast("User Created Successfully", "Success", ToastType.SUCCESS);
  //     }
  //   } catch (error) {
  //     log(LogLevel.ERROR, "User :: Add User", error);
  //     showToast(
  //       "Error adding user. Please try again.",
  //       "Error",
  //       ToastType.ERROR
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleAddUserClick = async () => {
    const errors = form.validate();
    if (Object.keys(errors.errors).length > 0) {
      showToast(
        "Please fix the validation errors.",
        "Validation Error",
        ToastType.WARNING
      );
      return;
    }

    setIsLoading(true);
    try {
      const values = form.values;
      let response;

      if (user_id) {
        response = await usersListService.updateUser(
          user_id,
          values.first_name,
          values.last_name,
          values.mobile_number,
          values.email_id,
          parseInt(values.role_id)
        );
        log(LogLevel.INFO, "User :: Update User", response);

        if (response.status === 200) {
          showToast("User Updated Successfully", "Success", ToastType.SUCCESS);
        }
      } else {
        response = await usersListService.addUser(
          values.first_name,
          values.last_name,
          values.mobile_number,
          values.email_id,
          parseInt(values.role_id)
        );
        log(LogLevel.INFO, "User :: Add User", response);

        if (response.status === 200) {
          showToast("User Created Successfully", "Success", ToastType.SUCCESS);
          form.reset();
        }
      }

      setTimeout(() => {
        close();
      }, 1000);
    } catch (error) {
      if (user_id) {
        log(LogLevel.ERROR, "User :: Update User", error);
      } else {
        log(LogLevel.ERROR, "User :: Add User", error);
      }

      showToast(
        "Error saving user. Please try again.",
        "Error",
        ToastType.ERROR
      );
    } finally {
      setIsLoading(false);
    }
  };

//   const handleGetUser = async (user_id: number) => {
//     try {
//       const response = await usersListService.getUser(user_id);
//       log(LogLevel.INFO, "User :: Get User", response);
//       if (response.data && response.data.data) {
//         form.setValues({
//           first_name: response.data.data.first_name,
//           last_name: response.data.data.last_name,
//           email_id: response.data.data.email_id,
//           mobile_number: response.data.data.mobile_number,
//           role_id: response.data.data.role_id.toString(),
//         });
//       }
//     } catch (error) {
//       log(LogLevel.ERROR, "User :: Get User", error);
//     }
//   };

//   useEffect(() => {
//     listRoles();
//     if (user_id) handleGetUser(user_id);
//   }, []);

  return (
    <form>
      <div className="mb-6">
        <label className="text-base">First Name</label>
        <TextInput
          radius="md"
          placeholder="Enter First Name"
          className="mt-2"
          {...form.getInputProps("first_name")}
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Last Name</label>
        <TextInput
          radius="md"
          placeholder="Enter Last Name"
          className="mt-2"
          {...form.getInputProps("last_name")}
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Email ID</label>
        <TextInput
          radius="md"
          placeholder="Enter Email ID"
          className="mt-2"
          {...form.getInputProps("email_id")}
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Mobile Number</label>
        <TextInput
          maxLength={10}
          type="text"
          radius="md"
          placeholder="Enter Mobile Number"
          className="mt-2"
          {...form.getInputProps("mobile_number")}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/\D/g, "").slice(0, 10);
          }}
        />
      </div>

      {/* Gender Dropdown */}
      {/* <div className="mb-6">
        <label className="text-base">Select Gender</label>
        <DropDown
          label="Select Gender*"
          value={form.values.gender}
          onChange={(value: string) => form.setFieldValue("gender", value)}
          options={genders}
        />
      </div> */}

      <div className="mb-6">
        <label className="text-base">Select Role</label>
        <DropDown
          value={form.values.role_id}
          error={form.errors.role_id}
          onChange={(value: string) => form.setFieldValue("role_id", value)}
          options={roles}
        />
      </div>

      <div className="fixed bottom-5 w-[25.5rem] justify-center">
        <Button
          type="button"
          color="#990007"
          fullWidth
          loading={isLoading}
          onClick={handleAddUserClick}
        >
          {user_id ? "Update User" : "Add User"}
        </Button>
      </div>
    </form>
  );
};

export default AddOrUpdateUser;
