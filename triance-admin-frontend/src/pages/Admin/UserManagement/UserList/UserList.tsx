import  { forwardRef, useEffect, useRef, useState } from "react";
import CommonDrawer from "../../../../components/common/Drawer/CommonDrawer";
import { IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Button, Tooltip } from "@mantine/core";
import CommonDataTable from "../../../../components/common/DataTable/CommonDataTable";
import { Column } from "../../../../components/common/DataTable/commonDataTableTypes";
import editIcon from "../../../../assets/User_List_Icons/edit.svg";
import deleteIcon from "../../../../assets/User_List_Icons/delete.svg";
import searchIcon from "../../../../assets/User_List_Icons/search-icon.svg";
import AddOrUpdateUser from "../AddOrUpdateUser/AddOrUpdateUser";

// Mock data and types
interface IUser {
  user_id: number;
  display_name: string;
  mobile_number: string;
  email_id: string;
  role_name: string;
  status: UserStatus;
}

enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted",
  LOGGED_IN = "logged_in",
  LOGGED_OUT = "logged_out",
}

interface UsersListProps {
  // Add any props you need here
}

const UserList = forwardRef<
  {
    refresh: () => void;
  },
  UsersListProps
>((props, ref) => {
  const [opened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const userListRef = useRef<{ refresh: () => void } | null>(null);

  const pageSize = 11;

  // Mock data initialization
  useEffect(() => {
    const mockUsers: IUser[] = [
      {
        user_id: 1,
        display_name: "John Doe",
        mobile_number: "+1234567890",
        email_id: "john.doe@example.com",
        role_name: "Admin",
        status: UserStatus.ACTIVE,
      },
      {
        user_id: 2,
        display_name: "Jane Smith",
        mobile_number: "+1987654321",
        email_id: "jane.smith@example.com",
        role_name: "Manager",
        status: UserStatus.INACTIVE,
      },
      {
        user_id: 3,
        display_name: "Robert Johnson",
        mobile_number: "+1122334455",
        email_id: "robert.j@example.com",
        role_name: "Developer",
        status: UserStatus.LOGGED_IN,
      },
      {
        user_id: 4,
        display_name: "Emily Davis",
        mobile_number: "+1555666777",
        email_id: "emily.d@example.com",
        role_name: "Designer",
        status: UserStatus.LOGGED_OUT,
      },
    ];

    setUsers(mockUsers);
    setUsersCount(mockUsers.length);
  }, []);

  const handleEdit = (userId: number) => {
    openDrawer();
    setUserId(userId);
  };

  const closeSlider = () => {
    closeDrawer();
    setUserId(null);
    // In static version, we don't refresh the list
  };

  const handleClose = () => {
    setUserId(null);
    // In static version, we don't refresh the list
  };

  const columns: Column[] = [
    { label: "Name", key: "display_name" },
    { label: "Mobile Number", key: "mobile_number" },
    { label: "Email Address", key: "email_id" },
    { label: "Role", key: "role_name" },
    { label: "Actions", key: "actions" },
  ];

  const handleUpdateUserStatus = (userId: number, status: UserStatus) => {
    setUsers((prevUsers) => {
      if (status === UserStatus.DELETED) {
        return prevUsers.filter((user) => user.user_id !== userId);
      } else {
        return prevUsers.map((user) =>
          user.user_id === userId ? { ...user, status } : user
        );
      }
    });
  };

  const handleSearch = (value: string) => {
    // In static version, we won't implement full search functionality
    setSearchQuery(value);
  };

  const debouncedHandleSearch = (value: string) => {
    // Simple implementation without debounce for static version
    handleSearch(value);
  };

  return (
    <div className="">
     <CommonDrawer
        opened={opened}
        onClose={() => closeSlider()}
        closeButtonProps={{
          icon: <IconX size={20} stroke={2} />,
        }}
        title={userId ? "Update User" : "Add User"}
      >
        <AddOrUpdateUser
          user_id={userId}
          close={closeDrawer}
       //   handleListUsers={handleListUsers}
        />
      </CommonDrawer>
      <h5 className="font-[500] text-2xl">User Management</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-0 mt-5">
        <div className="border border-[#C2C2C2] rounded-full px-3 py-1 flex items-center">
          <input
            type="search"
            className="w-full outline-none"
            placeholder="Search for Users"
            onChange={(e) => debouncedHandleSearch(e.target.value)}
          />
          <img src={searchIcon} alt="search-icon" />
        </div>
        <div className="flex justify-end">
          <Button style={{ background: "#990007" }} onClick={openDrawer}>
            Add User
          </Button>
        </div>
      </div>
      <CommonDataTable
        columns={columns}
        data={users}
        totalCount={usersCount}
        renderActions={(user: any) => (
          <div className="flex space-x-2">
            {/* <Switch
              color="#14B584"
              size="sm"
              onChange={() =>
                handleUpdateUserStatus(
                  user.user_id,
                  [
                    UserStatus.ACTIVE,
                    UserStatus.LOGGED_IN,
                    UserStatus.LOGGED_OUT,
                  ].includes(user.status)
                    ? UserStatus.INACTIVE
                    : UserStatus.ACTIVE
                )
              }
              checked={[
                UserStatus.ACTIVE,
                UserStatus.LOGGED_IN,
                UserStatus.LOGGED_OUT,
              ].includes(user.status)}
            />{" "} */}
            <Tooltip
              label="Edit"
              withArrow
              arrowPosition="center"
              color="#990007"
            >
              <img
                src={editIcon}
                alt="Edit"
                className="cursor-pointer"
                onClick={() => handleEdit(user.user_id)}
              />
            </Tooltip>
            <Tooltip
              label="Delete"
              withArrow
              arrowPosition="center"
              color="#990007"
            >
              <img
                src={deleteIcon}
                alt="Delete"
                className="cursor-pointer"
                onClick={() =>
                  handleUpdateUserStatus(user.user_id, UserStatus.DELETED)
                }
              />
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

export default UserList;