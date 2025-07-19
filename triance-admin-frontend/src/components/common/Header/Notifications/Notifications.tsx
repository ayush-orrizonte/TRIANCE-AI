import React from "react";
import notification_Icon from "../../../../assets/notification_Icon.svg";
import closeIcon from "../../../../assets/closeIcon.svg";
import { useEffect, useState, useRef } from "react";
import { useLogger } from "../../../../hooks";
import { LogLevel } from "../../../../enums";
import { INotification } from "./notificationsTypes";
import notificationsService from "./notificationsService";
import "./Notifications.scss";
import { NotificationStatus } from "./notificationsEnums";

const Notifications: React.FC = () => {
  const pageSize = 10;
  const { log } = useLogger();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = useRef<HTMLDivElement | null>(null);

  const listNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.listNotifications(
        pageSize,
        activePage
      );
      if (
        response.data &&
        response.data.data &&
        response.data.data.notifications
      ) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          ...response.data.data.notifications,
        ]);
        setNotificationsCount(response.data.data.notificationsCount);
        log(
          LogLevel.INFO,
          "Notifications :: listNotifications",
          response.data.data.notifications
        );
      }
    } catch (error) {
      log(LogLevel.ERROR, "Notifications :: listNotifications", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);

    if (daysAgo > 30) {
      return date.toLocaleDateString();
    } else if (daysAgo > 0) {
      return `${daysAgo}d ago`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo}h ago`;
    } else if (minutesAgo > 0) {
      return `${minutesAgo}m ago`;
    } else {
      return `${secondsAgo}s ago`;
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.notificationId !== id
      )
    );
  };

  useEffect(() => {
    listNotifications();
  }, [activePage]);

  return (
    <div className="space-y-1 max-w-lg">
      {loading && <p className="text-gray-500">Loading notifications...</p>}
      {notifications.map((notification, index) => (
        <div
          key={notification.notificationId}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md"
          ref={index === notifications.length - 1 ? lastNotificationRef : null}
          style={{
            ...(notification.status === NotificationStatus.UNREAD
              ? {
                  backgroundClip: "padding-box",
                  borderLeft: "4px solid transparent",
                  borderImage: "linear-gradient(200deg, #990007, #990007) 1",
                }
              : {}),
          }}
        >
          <div className="flex items-center space-x-2">
            <img
              src={notification_Icon}
              alt="Notification Icon"
              className="w-14 h-14 p-2"
            />
            <div>
              <p className="text-base font-medium text-black">
                {notification.notificationDescription}{" "}
                <span className="text-xs text-gray-500">
                  {formatDate(notification.dateCreated)}
                </span>
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => deleteNotification(notification.notificationId)}
          >
            <img src={closeIcon} alt="Close Icon" />
          </button>
        </div>
      ))}
      {!loading && notifications.length === 0 && (
        <p className="text-gray-500">No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
