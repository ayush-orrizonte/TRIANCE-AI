export enum MenuStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  DELETED = 2,
}

export enum AdminStatus {
  INACTIVE = 1,
  ACTIVE = 2,
  LOGGED_IN = 3,
  LOGGED_OUT = 4,
  DELETED = 5
}

export enum GridDefaultOptions {
  PAGE_SIZE = 10, 
  CURRENT_PAGE = 1,
}

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  BLOCKED = 3,
}

export enum Levels {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum RoleStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  ARCHIVED = 2,
}