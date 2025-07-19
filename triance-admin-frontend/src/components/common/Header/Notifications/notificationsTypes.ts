import { NotificationTypes , NotifiedUser , NotificationStatus } from "./notificationsEnums";



export interface INotification {
    notificationId: string;
    notifiedTo: string;
    notificationDescription: string;
    notificationType: NotificationTypes,
    notifiedUser: NotifiedUser;
    dateCreated: string;
    dateUpdated: string;
    isScheduled: boolean;
    scheduledTime: string;
    status: NotificationStatus;
  }