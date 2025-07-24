import React, { useEffect, useState } from "react";
import { TextInput, Button, Select } from "@mantine/core";
import usersListService from "../UserList/usersListService";
import { useForm, yupResolver } from "@mantine/form";
import addOrUpdateUserValidation from "./addOrUpdateUserValidations";
import { useLogger, useToast } from "../../../../hooks";
import { LogLevel, ToastType } from "../../../../enums";
import { AddOrUpdateUserProps } from "./addOrUpdateUserTypes";

const AddOrUpdateUser: React.FC<AddOrUpdateUserProps> = ({
  admin_id,
  close,
  handleListUsers
}) => {
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { log } = useLogger();
  const { showToast } = useToast();


  const form = useForm({
    initialValues: {
      admin_name: "",
      admin_email: "",
      role_id: "",
      level: "user" 
    },
    validate: yupResolver(addOrUpdateUserValidation.validateAddOrUpdateUser()),
  });


  const listRoles = async () => {
    try {
      const response = await usersListService.listRoles(50, 1, true);
      log(LogLevel.INFO, "Roles :: listRoles", response);
      if (response.data && response.data.data) {
        const transformedRoles = response.data.data.rolesList.map(
          (role: { role_name: string; role_id: number }) => ({
            label: role.role_name,
            value: role.role_id.toString(),
          })
        );
        setRoles(transformedRoles);
      }
    } catch (error) {
      log(LogLevel.ERROR, "Roles :: listRoles", error);
      showToast(
        "Failed to load roles. Please try again later.",
        "Error",
        ToastType.ERROR
      );
    }
  };

 
  const handleGetUser = async (admin_id: number) => {
    try {
      const response = await usersListService.getUser(admin_id);
      log(LogLevel.INFO, "User :: Get User", response);
      if (response.data && response.data.data) {
        form.setValues({
          admin_name: response.data.data.admin_name,
          admin_email: response.data.data.admin_email,
          role_id: response.data.data.role_id?.toString() || "",
          level: response.data.data.level || "user"
        });
      }
    } catch (error) {
      log(LogLevel.ERROR, "User :: Get User", error);
    }
  };

const handleSubmit = async () => {
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

    if (admin_id) {
 
      response = await usersListService.updateUser(
        Number(values.role_id), 
        values.admin_name,
        values.admin_email, 
        admin_id, 
        values.level 
      );
      log(LogLevel.INFO, "User :: Update User", response);
      showToast("User Updated Successfully", "Success", ToastType.SUCCESS);
    } else {
      
      response = await usersListService.addUser(
        values.admin_name, 
        values.level,
        values.admin_email, 
        Number(values.role_id) 
      );
      log(LogLevel.INFO, "User :: Add User", response);
      showToast("User Created Successfully", "Success", ToastType.SUCCESS);
      form.reset();
    }

    handleListUsers(); 
    setTimeout(() => close(), 1000);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Error saving user. Please try again.";
    log(LogLevel.ERROR, admin_id ? "User :: Update User" : "User :: Add User", error);
    showToast(
      errorMessage,
      "Error",
      ToastType.ERROR
    );
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    listRoles();
    if (admin_id) handleGetUser(admin_id);
  }, [admin_id]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="mb-6">
        <label className="text-base">Full Name</label>
        <TextInput
          radius="md"
          placeholder="Enter Full Name"
          className="mt-2"
          {...form.getInputProps("admin_name")}
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Email Address</label>
        <TextInput
          radius="md"
          placeholder="Enter Email Address"
          className="mt-2"
          {...form.getInputProps("admin_email")}
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Role</label>
        <Select
          data={roles}
          placeholder="Select Role"
          className="mt-2"
          {...form.getInputProps("role_id")}
          searchable
        
        />
      </div>

      <div className="mb-6">
        <label className="text-base">Access Level</label>
        <Select
          data={[
            { value: "super", label: "Super" },
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" }
          ]}
          placeholder="Select Access Level"
          className="mt-2"
          {...form.getInputProps("level")}
        />
      </div>

      <div className="fixed bottom-5 w-[25.5rem] justify-center">
        <Button
          type="submit"
          color="#990007"
          fullWidth
          loading={isLoading}
        >
          {admin_id ? "Update User" : "Add User"}
        </Button>
      </div>
    </form>
  );
};

export default AddOrUpdateUser;