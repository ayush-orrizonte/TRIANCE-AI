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
  const { log } = useLogger();
  const { showToast } = useToast();
  const [isClicked, setIsClicked] = useState(false);

  const form = useForm({
    initialValues: {
      role_name: "",
      role_description: "",
      permissions: [] as { menu_id: string; permission_id: string }[],
    },
    validate: yupResolver(addOrUpdateRoleValidation.validateAddOrUpdateRole()),
  });

  const [defaultAccessList, setDefaultAccessList] = useState<IDefaultAccess[]>([]);

  const getDefaultAccessList = async () => {
    try {
      const res = await addOrUpdateRoleService.getDefaultAccessList();
      const accessList = res?.data?.data?.data || [];
      setDefaultAccessList(accessList);
      log(LogLevel.INFO, "getDefaultAccessList", accessList);
    } catch (error) {
      log(LogLevel.ERROR, "getDefaultAccessList", error);
    }
  };

  const getAccessList = async (roleId: number) => {
    try {
      const res = await addOrUpdateRoleService.getAccessList(roleId);
      const role = res?.data?.data;

      if (role) {
        const permissions =
          role.permissions?.[0]?.permissions?.map((p: any) => ({
            menu_id: p.menuId,
            permission_id: p.permissionId,
          })) || [];

        form.setValues({
          role_name: role.role_name || role.roleName,
          role_description: role.role_description || role.roleDescription,
          permissions,
        });

        log(LogLevel.INFO, "getAccessList", permissions);
      }
    } catch (error) {
      log(LogLevel.ERROR, "getAccessList", error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await getDefaultAccessList();

      if (roleId) {
        await getAccessList(roleId);
      }
    };

    fetchAll();
  }, [roleId]);

  const getPermissions = (menuId: string) => {
    const access = form.values.permissions.find(p => p.menu_id.toString() === menuId);
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
    const permissionId = permission === MenuAccess.READ ? "2" : "1";

    const updated = checked
      ? [
          ...form.values.permissions.filter(p => p.menu_id.toString() !== menuId),
          { menu_id: menuId, permission_id: permissionId },
        ]
      : form.values.permissions.filter(
          p => !(p.menu_id.toString() === menuId && p.permission_id === permissionId)
        );

    form.setValues(prev => ({
      ...prev,
      permissions: updated,
    }));
  };

  const groupedAccessList = defaultAccessList.reduce(
    (acc: Record<number, IDefaultAccess[]>, item: IDefaultAccess) => {
      if (!acc[item.menu_id]) acc[item.menu_id] = [];
      acc[item.menu_id].push(item);
      return acc;
    },
    {}
  );

  const handleSubmit = async (values: typeof form.values) => {
    const errors = form.validate();
    if (Object.keys(errors.errors).length > 0) {
      showToast("Please fix the validation errors.", "Validation Error", ToastType.WARNING);
      return;
    }

    try {
      const payload = values.permissions.map(p => ({
        menuId: p.menu_id,
        permissionId: p.permission_id,
      }));

      const response = roleId
        ? await addOrUpdateRoleService.updateRole(
            roleId,
            values.role_name,
            values.role_description,
            payload
          )
        : await addOrUpdateRoleService.addRole(
            values.role_name,
            values.role_description,
            payload
          );

      if (response.status === 200) {
        showToast(
          roleId ? "Role Updated" : "Role Added",
          "Success",
          ToastType.SUCCESS
        );
        form.reset();
        setTimeout(() => {
          close();
          listRoles();
        }, 1000);
      }
    } catch (error) {
      log(LogLevel.ERROR, "handleSubmit", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4">
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

        <div className="mt-14">
          <div className="mb-6 border rounded-xl p-5 border-gray-300 relative">
            <div className="absolute -top-3.5 left-32 bg-white px-2">
              Role Permissions
            </div>
            <div className="mb-6">
              {Object.entries(groupedAccessList).map(([menu_id, permissions]) => (
                <div key={menu_id} className="mb-4">
                  <div className="mb-2">{permissions[0]?.menu_name}</div>
                  <div className="flex justify-between mr-6">
                    <Checkbox
                      label={MenuAccess.READ}
                      checked={getPermissions(menu_id).read}
                      onChange={(e) =>
                        handlePermissionChange(menu_id, MenuAccess.READ, e.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label={MenuAccess.WRITE}
                      checked={getPermissions(menu_id).write}
                      onChange={(e) =>
                        handlePermissionChange(menu_id, MenuAccess.WRITE, e.currentTarget.checked)
                      }
                    />
                  </div>
                </div>
              ))}
              {isClicked && form.values.permissions.length === 0 && (
                <p className="text-[#fa5252] text-xs mt-3">
                  Please select at least one permission.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 w-[25.5rem]">
        <MantineProvider>
          <Button
            type="button"
            color="#5752de"
            fullWidth
            onClick={() => {
              setIsClicked(true);
              handleSubmit(form.values);
            }}
          >
            {roleId ? "Update Role" : "Add Role"}
          </Button>
        </MantineProvider>
      </div>
    </div>
  );
};

export default AddOrUpdateRole;