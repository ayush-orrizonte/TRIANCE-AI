
export enum NotificationTypes {
    CUSTOMER_CREATED = 1,
    CUSTOMER_TO_BE_NOTIFIED = 2,
    CUSTOMER_SUPPORT = 3,
    CUSTOMER_ORDER = 4,
    CUSTOMER_ONBOARD = 5,
    NEW_GALLERY_IMAGES = 6
  }
  
  export enum NotifiedUser {
    ADMIN = 1,
    CUSTOMER = 2
  }
  
  export enum NotificationStatus {
    UNREAD = 1,
    READ = 2
  }
  
  export enum NotificationsGridDefaultOptions {
    PAGE_SIZE = 10,
    CURRENT_PAGE = 1
  }