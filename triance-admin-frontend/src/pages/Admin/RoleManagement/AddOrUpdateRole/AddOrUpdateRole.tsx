import React, { useEffect, useState } from "react";
import { TextInput, Button, Checkbox, MantineProvider } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import addOrUpdateRoleValidation from "./addOrUpdateRoleValidation";
import { AddOrUpdateRoleProps, IDefaultAccess } from "./addOrUpdateRoleTypes";
import { LogLevel, MenuAccess, ToastType } from "../../../../enums";
import { addOrUpdateRoleService } from "./addOrUpdateRoleService";
import { useLogger, useToast } from "../../../../hooks";

const AddOrUpdateRole: React.FC<AddOrUpdateRoleProps> = ({
  roleId,
  close,
  listRoles,
}) => {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [level, setLevel] = useState("");
  const { log } = useLogger();
  const { showToast } = useToast();
  const [admin, setAdmin] = useState("");

  const form = useForm({
    initialValues: {
      role_name: "",
      role_description: "",
      permissions: [] as { menu_id: string; permission_id: string }[],
    },
    validate: yupResolver(addOrUpdateRoleValidation.validateAddOrUpdateRole()),
  });

  const [defaultAccessList, setDefaultAccessList] = useState<IDefaultAccess[]>(
    []
  );
  const [levels, setLevels] = useState<{ value: string; label: string }[]>([]);

  const [isClicked, setIsClicked] = useState(false);

  const handleChange = (name: string, value: string | number | boolean) => {
    form.setValues({
      ...form.values,
      [name]: value,
    });
  };

  const getDefaultAccessList = async () => {
    try {
      const response = await addOrUpdateRoleService.getDefaultAccessList();
      log(LogLevel.INFO, "RoleList :: getDefaultAccessList", response.data);
      if (response.data && response.data.data) {
        setDefaultAccessList(response.data.data.data);
      }
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: getDefaultAccessList", error);
    }
  };

  const getAccessList = async (roleId: number) => {
    try {
      const response = await addOrUpdateRoleService.getAccessList(roleId);
      log(LogLevel.INFO, "RoleList :: getAccessList", response.data);
      if (response.data && response.data.data) {
        const permissions: { menu_id: number; permission_id: number }[] = [];
        for (const access of response.data.data) {
          if (
            access.display_permission === 1 &&
            access.read_permission === "1"
          ) {
            permissions.push({ menu_id: access.menu_id, permission_id: 2 });
          } else if (
            access.display_permission === 1 &&
            access.write_permission === "1"
          ) {
            permissions.push({ menu_id: access.menu_id, permission_id: 1 });
          }
        }
        form.setValues((prevValues: any) => ({
          ...prevValues,
          permissions,
        }));
      }
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: getAccessList", error);
    }
  };

  const getRole = async () => {
    try {
      const response = await addOrUpdateRoleService.getRole();
      log(LogLevel.INFO, "RoleList :: getRole", response.data);
      if (response.data && response.data.data) {
        form.setValues({
          role_name: response.data.data.role_name,
          role_description: response.data.data.role_description,

          permissions: response.data.data.permissions || [],
        });
      }
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: getRole", error);
    }
  };

  const listLevels = async () => {
    try {
      const response = await addOrUpdateRoleService.listLevels();
      log(LogLevel.INFO, "RoleList :: listLevels", response.data);
      if (response.data && response.data.data) {
        const transformedLevels = response.data.data.map((level: string) => ({
          label: level,
          value: level,
        }));
        setLevels(transformedLevels);
      }
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: listLevels", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getDefaultAccessList();
        await listLevels();

        if (roleId) {
          const [roleResponse] = await Promise.all([
          

            addOrUpdateRoleService.getAccessList(roleId),
          ]);

          log(LogLevel.INFO, "RoleList :: getRole", roleResponse.data);
        //  log(LogLevel.INFO, "RoleList :: getAccessList", accessResponse.data);

          if (roleResponse.data && roleResponse.data.data) {
            const role = roleResponse.data.data;

            const extractedPermissions =
              role.permissions?.[0]?.permissions?.map((item: any) => ({
                menu_id: item.menuId,
                permission_id: item.permissionId,
              })) || [];

            form.setValues({
              role_name: role.role_name || role.roleName,
              role_description: role.role_description || role.roleDescription,
              permissions: extractedPermissions,
            });
          }

        
        }
      } catch (error) {
        log(LogLevel.ERROR, "AddOrUpdateRole :: fetchData", error);
      }
    };

    fetchData();
  }, [roleId]);



 

  const getPermissions = (menuId: string) => {
    const access = form.values.permissions.find(
      (p) => p.menu_id.toString() === menuId
    );
    return {
      read: access?.permission_id === "2",
      write: access?.permission_id === "1",
    };
  };

  const handlePermissionChange = (
    menuId: string,
    permission: MenuAccess,
    checked: boolean
  ) => {
    console.log("Permission Changed:", menuId, permission, checked);
    const permissionId = permission === MenuAccess.READ ? "2" : "1";
    const updatedPermissions = checked
      ? [
          ...form.values.permissions.filter(
            (p) => p.menu_id.toString() !== menuId
          ),
          { menu_id: menuId, permission_id: permissionId },
        ]
      : form.values.permissions.filter(
          (p) =>
            !(
              p.menu_id.toString() === menuId &&
              p.permission_id === permissionId
            )
        );

    form.setValues((prevValues: any) => ({
      ...prevValues,
      permissions: updatedPermissions,
    }));
  };

  console.log(defaultAccessList, "defaultAccessList");

  const groupedAccessList =
    defaultAccessList.length > 0 &&
    defaultAccessList.reduce(
      (acc: Record<number, IDefaultAccess[]>, item: IDefaultAccess) => {
        if (!acc[item.menu_id]) {
          acc[item.menu_id] = [];
        }
        acc[item.menu_id].push(item);
        return acc;
      },
      {}
    );

  const handleSubmit = async (values: {
    role_name: string;
    role_description: string;
    level: string;
    permissions: { menu_id: string; permission_id: string }[];
  }) => {
    const errors = form.validate();
    if (Object.keys(errors.errors).length > 0) {
      showToast(
        "Please fix the validation errors.",
        "Validation Error",
        ToastType.WARNING
      );
      return;
    }
    try {
      console.log(values);
      console.log("Final payload:", values.permissions);

      if (roleId) {
        const response = await addOrUpdateRoleService.updateRole(
          roleId,
          values.role_name,
          values.role_description,
          // values.level,
          values.permissions.map((p: any) => ({
            menuId: p.menu_id,
            permissionId: p.permission_id,
          }))
        );

        if (response.status === 200)
          showToast("Role Updated", "Success", ToastType.SUCCESS);
      } else {
        const response = await addOrUpdateRoleService.addRole(
          values.role_name,
          values.role_description,
          // values.level,
          values.permissions.map((p: any) => ({
            menuId: p.menu_id,
            permissionId: p.permission_id,
          }))
        );
        if (response.status === 200)
          showToast("Role Added", "Success", ToastType.SUCCESS);
        form.reset();
      }
      setTimeout(async () => {
        close();
        listRoles();
      }, 1000);
    } catch (error) {
      log(LogLevel.ERROR, "AddOrUpdateRole :: handleSubmit", error);
    }
  };
  console.log(form.values, "form.values");

  const handleButtonClick = () => {
    setIsClicked(true);
    handleSubmit(form.values as any); // Ensure the form submit handler is still called
  };

  return (
    <div className="h-full s flex flex-col">
      <div
        className="overflow-y-auto h-[calc(100vh-4rem)] p-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#ccc transparent",
        }}
      >
        <div className="mb-6">
          <label className="text-base">Role Name</label>
          <TextInput
            radius="md"
            placeholder="Enter Role Name"
            className="mt-2"
            {...form.getInputProps("role_name")}
          />
        </div>
        <div className="mb-6">
          <label className="text-base">Role Description</label>
          <TextInput
            radius="md"
            placeholder="Enter Role Description"
            className="mt-2"
            {...form.getInputProps("role_description")}
          />
        </div>
        {/* <div className="mb-6">
          <label className="text-base">Level</label>
          <TextInput
            radius="md"
            placeholder="Enter Level"
            className="mt-2"
            {...form.getInputProps("level")}
          />
        </div> */}
        <div className="mt-14">
          <div className="mb-6 relative border rounded-xl p-5 border-gray-300">
            <div className="absolute -top-3.5 left-32 bg-white px-2 ">
              Role Permissions
            </div>
            <div className="mb-6">
              {Object.entries(groupedAccessList).map(
                ([menu_id, permissions]) => (
                  <div key={menu_id} className="mb-4">
                    <div className="mb-2">{permissions[0]?.menu_name}</div>
                    <div key={menu_id}>
                      <div className="flex justify-between mr-6">
                        <Checkbox
                          label={MenuAccess.READ}
                          checked={getPermissions(menu_id).read}
                          onChange={(e) =>
                            handlePermissionChange(
                              menu_id,
                              MenuAccess.READ,
                              e.currentTarget.checked
                            )
                          }
                        />
                        <Checkbox
                          label={MenuAccess.WRITE}
                          checked={getPermissions(menu_id).write}
                          onChange={(e) =>
                            handlePermissionChange(
                              menu_id,
                              MenuAccess.WRITE,
                              e.currentTarget.checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
              {isClicked && form.values.permissions.length === 0 && (
                <p className="text-[#fa5252] text-xs !mt-3">
                  Please select at least one
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-5 w-[25.5rem] justify-center">
        <MantineProvider>
          <Button
            type="button"
            color="#5752de"
            onClick={handleButtonClick}
            fullWidth
          >
            {roleId ? "Update Role" : "Add Role"}
          </Button>
        </MantineProvider>
      </div>
    </div>
  );
};

export default AddOrUpdateRole;
