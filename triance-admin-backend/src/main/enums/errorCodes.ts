const users = {
  USER00000: {
    errorCode: "USER00000",
    errorMessage: "Internal Server Error",
  },
  USER00001: {
    errorCode: "USER00001",
    errorMessage: "Invalid User name length, It must be within 3 and 20",
  },
  USER00002: {
    errorCode: "USER00002",
    errorMessage: "Invalid Display Name length, It must be within 3 and 20",
  },
  USER00003: {
    errorCode: "USER00003",
    errorMessage: "Invalid First Name length, It must be within 3 and 20",
  },
  USER00004: {
    errorCode: "USER00004",
    errorMessage: "Invalid Last Name length, It must be within 3 and 20",
  },
  USER00005: {
    errorCode: "USER00005",
    errorMessage: "User with Requested Mobile number already exists!",
  },
  USER00006: {
    errorCode: "USER00006",
    errorMessage: "User Id Required!",
  },
  USER00007: {
    errorCode: "USER00007",
    errorMessage: "Role Id Required!",
  },
  USER000011: {
    errorCode: "USER000011",
    errorMessage: "User with Requested Id does not exists!",
  },
  USER000012: {
    errorCode: "USER000012",
    errorMessage: "User Requested to report does not exists!",
  },
  USER000013: {
    errorCode: "USER000013",
    errorMessage: "Role Id Invalid!",
  },
  USER000014: {
    errorCode: "USER000014",
    errorMessage: "Invalid User Status!",
  },
};
const roles = {
  ROLE00000: {
    errorCode: "ROLE0000",
    errorMessage: "Internal Server Error",
  },
  ROLE00001: {
    errorCode: "ROLE00001",
    errorMessage: "Invalid Role name length, It must be within 3 and 20",
  },
  ROLE00002: {
    errorCode: "ROLE00002",
    errorMessage: "Invalid Role Description length, It must be within 3 and 50",
  },
  ROLE00003: {
    errorCode: "ROLE00003",
    errorMessage: "Role Id Required!",
  },
  ROLE00004: {
    errorCode: "ROLE00004",
    errorMessage: "Invalid Role Status!",
  },
  ROLE00005: {
    errorCode: "ROLE00005",
    errorMessage: "User Id Required!",
  },
  ROLE00006: {
    errorCode: "ROLE00006",
    errorMessage: "Requested Role does not exists!",
  },
  ROLE00007: {
    errorCode: "ROLE00007",
    errorMessage: "Role with Requested Name already exists!",
  },
  ROLE00008: {
    errorCode: "ROLE00008",
    errorMessage: "Requested User does not exists!",
  },
  ROLE00009: {
    errorCode: "ROLE00009",
    errorMessage: "Level Required!",
  },
  ROLE00010: {
    errorCode: "ROLE00010",
    errorMessage: "Permissions are Required!",
  },
  ROLE00011: {
    errorCode: "ROLE00011",
    errorMessage: "Invalid Level!",
  },
};
const menus = {
  MENUS000: {
    errorCode: "MENUS000",
    errorMessage: "Internal Server Error",
  },
  MENUS001: {
    errorCode: "MENUS001",
    errorMessage: "Requested Menu does not exists!",
  },
  MENUS002: {
    errorCode: "MENUS002",
    errorMessage: "Menu Id Required!",
  },
  MENUS003: {
    errorCode: "MENUS003",
    errorMessage: "Invalid Menu Status!",
  },
  MENUS004: {
    errorCode: "MENUS004",
    errorMessage: "Invalid Menu Id!",
  },
  MENUS005: {
    errorCode: "MENUS005",
    errorMessage: "Requested Menu name already exists!",
  },
};

const password_policies = {
  PASSWORDPOLICIES000: {
    errorCode: "PASSWORDPOLICIES000",
    errorMessage: "Internal Server Error",
  },
  PASSWORDPOLICIES001: {
    errorCode: "PASSWORDPOLICIES001",
    errorMessage: "Requested Password Policy does not exists!",
  },
  PASSWORDPOLICIES002: {
    errorCode: "PASSWORDPOLICIES002",
    errorMessage: "Password Policy Id Required!",
  },
}
   const admins = {
  ADMIN000: {
    errorCode: "ADMIN000",
    errorMessage: "Internal Server Error",
  },
  ADMIN001: {
    errorCode: "ADMIN001",
    errorMessage: "Bad Request",
  },
  ADMIN002: {
    errorCode: "ADMIN002",
    errorMessage: "Account with Email already exists!",
  },
  ADMIN003: {
    errorCode: "ADMIN003",
    errorMessage: "Invalid Profile Picture, PNG or JPEG Required!",
  },
  ADMIN004: {
    errorCode: "ADMIN004",
    errorMessage: "Maximum Size Exceeded for Profile Picture, It must be less than 5MB!",
  },
  ADMIN005: {
    errorCode: "ADMIN005",
    errorMessage: "Requested Admin does not exist!",
  },
  ADMIN006: {
    errorCode: "ADMIN006",
    errorMessage: "One or more permission groups do not exist!",
  },
  ADMIN007: {
    errorCode: "ADMIN007",
    errorMessage: "Unauthorized action for this admin role!",
  },
};



export { menus, password_policies, users, roles ,admins };
