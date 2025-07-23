import React, { useEffect, useState } from "react";
import HeaderLogo from "../../../assets/logo.png";

import SideBarMenu from "../SideBarMenu/SideBarMenu";
import { useAuth, useLogger } from "../../../hooks";
import { Avatar, Text, Image, Button, HoverCard } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CommonDrawer from "../Drawer/CommonDrawer";
import { IconX } from "@tabler/icons-react";
// import ProfileManagement from "../../../pages/Admin/ProfileManagement/ProfileManagement";
// import bellIcon from "../../../assets/bellIcon.svg";
// import ProfileImage from "../../../assets/images/profile_image.svg";
import Notifications from "./Notifications/Notifications";
import headerService from "./headerService";
import { LogLevel } from "../../../enums";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  const { sideMenuOpen, setSideMenuOpen } = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedProfile, setOpenedProfile] = useState(false);
  const { isAuthenticated, setUserDetailsToContext, userDetails } = useAuth();
  const { log } = useLogger();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(0);

  const getLoggedInUserInfo = async () => {
    try {
      const response = await headerService.getLoggedInUserInfo();
      if (response.data && response.data.data) {
        log(LogLevel.INFO, "Header :: Logged In User Info", response.data.data);
        setUserDetailsToContext(response.data.data);
        setUserData(response.data.data);
      }
    } catch (error) {
      log(LogLevel.ERROR, "Header :: Logged In User Info", error);
    }
  };

  const getUnreadNotificationsCount = async () => {
    try {
      const response = await headerService.getUnreadNotificationsCount();
      if (response.data && response.data.data) {
        setUnreadNotificationsCount(response.data.data);
      }
    } catch (error) {
      log(LogLevel.ERROR, "Header :: Unread Notifications Count", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // getUnreadNotificationsCount();
      if (!userDetails) getLoggedInUserInfo();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await headerService.logout();
      await logout();
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      log(LogLevel.ERROR, "ProfileOptions :: handleLogout", error);
    }
  };

  const handleClose = () => {
    setUnreadNotificationsCount(0);
    close();
  };

  return (
    <>
      {sideMenuOpen ? (
        <div className="absolute top-0 right-0 bg-white border-l border-l-gray-500 h-screen w-[90%] z-50 sm:w-3/4">
          <div
            className="flex justify-end items-center shadow p-3"
            onClick={() => setSideMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </div>
          <div className="p-3">
            <SideBarMenu />
          </div>
        </div>
      ) : null}

      <div className="bg-[#5752de] px-5 py-4 flex items-center justify-between fixed top-0 w-full z-10">
        <div className="">
         <h1 className="text-white  font-bold text-2xl">TRIANCE-AI</h1>
        </div>

        <div className="flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center">
                <CommonDrawer
                  opened={opened}
                  onClose={handleClose}
                  position="right"
                  title="Notifications"
                  closeButtonProps={{
                    icon: <IconX size={20} stroke={1.5} />,
                    className: "mr-4",
                  }}
                >
                  <Notifications />
                </CommonDrawer>
                {/* <div onClick={open} className="relative cursor-pointer mr-1">
                  <img src={bellIcon} alt="bell" className="w-7 h-7" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-white text-xs bg-red-500 rounded-full px-1.5">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div> */}
              </div>
              {/* <CommonDrawer
                opened={openedProfile}
                onClose={() => setOpenedProfile(false)}
                closeButtonProps={{
                  icon: <IconX size={20} stroke={2} />,
                }}
                title={"Profile Settings"}
              >
                <ProfileManagement
                  closeSlider={() => setOpenedProfile(false)}
                />
              </CommonDrawer> */}

              <HoverCard width={200} shadow="md">
                <HoverCard.Target>
                  <div className="flex items-center space-x-4 cursor-pointer">
                    <div className="flex items-center px-3 py-1">
                      {/* <Image
                        src={
                          userDetails?.profilePicUrl
                            ? userDetails?.profilePicUrl
                            : userData?.profilePicUrl
                              ? userData?.profilePicUrl
                              : ProfileImage
                        }
                        alt="User Avatar"
                        radius="xl"
                        className="!w-10 h-10"
                      /> */}
                    <h1>Logout</h1>
                      <Text className="!ml-2 !text-white !font-medium !text-sm !tracking-wide">
                        {userDetails?.displayName
                          ? userDetails?.displayName
                          : userData?.display_name}
                      </Text>
                    </div>
                    <div
                      className="block md:hidden"
                      onClick={() => setSideMenuOpen(true)}
                    >
                      <FontAwesomeIcon stroke="25" icon={faBars} />
                    </div>
                  </div>
                </HoverCard.Target>
                <HoverCard.Dropdown className="z-[-1]">
                  <div
                    className="cursor-pointer text-base pb-2"
                    onClick={() => setOpenedProfile(true)}
                  >
                    Profile Settings
                  </div>
                  <div className="border-t border-slate-800"></div>
                  <div
                    className="cursor-pointer text-base pt-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </HoverCard.Dropdown>
              </HoverCard>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Header;
