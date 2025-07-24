import React, { forwardRef, useEffect, useRef, useState } from "react";
import CommonDrawer from "../../../../components/common/Drawer/CommonDrawer";
import { IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Button, Switch, Tooltip } from "@mantine/core";
import CommonDataTable from "../../../../components/common/DataTable/CommonDataTable";
import deleteIcon from "../../../../../src/assets/User_List_Icons/delete.svg";
import searchIcon from "../../../../../src/assets/User_List_Icons/search-icon.svg";
import rolesListService from "./rolesListService";
import { LogLevel } from "../../../../enums";
import { useLogger } from "../../../../hooks";
import { IRole, RolesListProps } from "./rolesListTypes";
import { RolesStatus } from "./rolesListEnum";
import AddOrUpdateRole from "../AddOrUpdateRole/AddOrUpdateRole";
import editIcon from "../../../../../src/assets/User_List_Icons/edit.svg";
import { debounce } from "lodash";

const RolesList = forwardRef<
  {
    refresh: () => void;
  },
  RolesListProps
>(({}, ref) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [opened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const pageSize = 10;
  const [activePage, setActivePage] = useState<number>(1);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [rolesCount, setRolesCount] = useState<number>(0);
  const [roleId, setRoleId] = useState<number | null>(null);
  const { log } = useLogger();
  const rolesListRef = useRef<{ refresh: () => void } | null>(null);

  const handleEdit = (roleId: number) => {
    openDrawer();
    setRoleId(roleId);
  };

  const columns = [
    { label: "Role", key: "role_name" },
    { label: "Role Description", key: "role_description" },
    { label: "Actions", key: "actions" },
  ];

  const listRoles = async () => {
    try {
      const payload = {
        is_active: true,
        page_size: pageSize,
        current_page: currentPage,
        searchFilter: searchFilter,
      };
      const response = await rolesListService.listRoles(payload);
      log(LogLevel.INFO, "RoleList :: listRoles", response);
      if (response?.data?.data) {
        setRoles(response?.data?.data?.rolesList);
        setRolesCount(response.data.data.rolesCount);
      }
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: listRoles", error);
    }
  };

  const handleUpdateRoleStatus = async (
    role_id: number,
    status: RolesStatus
  ) => {
    try {
      const response = await rolesListService.updateRoleStatus(role_id, status);
      log(LogLevel.INFO, "RoleList :: handleUpdateRoleStatus", response.data);
      listRoles();
    } catch (error) {
      log(LogLevel.ERROR, "RoleList :: handleUpdateRoleStatus", error);
    }
  };

  const handleSearch = (value: string) => {
    if (value.length > 3) {
      setSearchFilter(value);
    } else if (value.length === 0) {
      setSearchFilter("");
    }
  };

  const debouncedHandleSearch = debounce(handleSearch, 300);

  useEffect(() => {
    listRoles();
  }, [currentPage, searchFilter]);

  const closeSlider = () => {
    closeDrawer();
    setRoleId(null);
    listRoles();
  };
  const handleClose = () => {
    setRoleId(null);
    rolesListRef.current?.refresh();
  };

  return (
    <div>
      <CommonDrawer
        opened={opened}
        onClose={() => closeSlider()}
        closeButtonProps={{
          icon: <IconX size={20} stroke={2} />,
        }}
        title="Add Role"
        position="right"
        size="md"
      >
        <AddOrUpdateRole
          roleId={roleId}
          close={closeSlider}
          listRoles={listRoles}
        />
      </CommonDrawer>

      <h5 className="font-[500] text-2xl">Role Management</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-0 mt-5">
        <div className="border border-[#C2C2C2] rounded-full px-3 py-1 flex items-center">
          <input
            type="search"
            className="w-full outline-none"
            placeholder="Search for Roles"
            onChange={(e) => debouncedHandleSearch(e.target.value)}
          />
          <img src={searchIcon} alt="search-icon" />
        </div>
        <div className="flex justify-end">
          <Button style={{ background: "#5752de" }} onClick={openDrawer}>
            Add Role
          </Button>
        </div>
      </div>

      <CommonDataTable
        columns={columns}
        data={roles}
        totalCount={rolesCount}
        renderActions={(row) => (
          <div className="flex space-x-2">
            {row.status === RolesStatus.ACTIVE || row.status === RolesStatus.INACTIVE ? (
              <Switch
                color="#14B584"
                size="sm"
                onChange={() =>
                  handleUpdateRoleStatus(
                    row.role_id,
                    row.status === RolesStatus.ACTIVE
                      ? RolesStatus.INACTIVE
                      : RolesStatus.ACTIVE
                  )
                }
                checked={row.status === RolesStatus.ACTIVE}
              />
            ) : null}
            
            <Tooltip label="Edit" withArrow color="#5752de">
              <button
                onClick={() => {
                  log(LogLevel.INFO, `Editing role with ID: ${row.role_id}`);
                  handleEdit(row.role_id);
                }}
                className="cursor-pointer"
              >
                <img src={editIcon} alt="Edit" />
              </button>
            </Tooltip>

            <Tooltip label="Delete" withArrow>
              <button
                onClick={() =>
                  handleUpdateRoleStatus(row.role_id, RolesStatus.DELETED)
                }
                className="cursor-pointer"
              >
                <img src={deleteIcon} alt="Delete" />
              </button>
            </Tooltip>
          </div>
        )}
        pageSize={pageSize}
        isPagination={true}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
});

export default RolesList;
