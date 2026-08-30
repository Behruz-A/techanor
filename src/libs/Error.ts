export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
  NOT_FOUND = 404,
  INTERNAL_SEVER_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong!",
  NO_DATA_FOUND = "No data is found!",
  CREATION_FAILED = "Creation is failed!",
  UPDATE_FAILED = "Update is failed!",

  USED_NICK_PHONE = "You are inserting already used nick or phone!",
  INVALID_MEMBER_NICK = "Username must be 2 to 30 characters and use only letters, numbers, or underscores!",
  INVALID_MEMBER_PHONE = "Enter a valid phone number containing 7 to 15 digits!",
  INVALID_MEMBER_PASSWORD = "Password must be between 6 and 72 characters!",
  NO_MEMBER_NICK = "No member with that member nick!",
  BLOCKED_USER = "You have been blocked, contact the Admin",
  WRONG_PASSWORD = "Wrong passsword, please try again!",
  NOT_AUTHENTICATED = "You are not authenticated, Please login first!",
  TOKEN_CREATION_FAILED = "Token creation error!",
  GOOGLE_AUTH_NOT_CONFIGURED = "Google authentication is not configured!",
  GOOGLE_CREDENTIAL_REQUIRED = "Google credential is required!",
  INVALID_GOOGLE_CREDENTIAL = "Google credential is invalid!",
  GOOGLE_EMAIL_NOT_VERIFIED = "Google email is not verified!",
  GOOGLE_ACCOUNT_NOT_ALLOWED = "This Google account is not authorized!",
  GOOGLE_ACCOUNT_CONFLICT = "This Google account conflicts with an existing member!",
  STORE_ACCOUNT_REQUIRED = "Create the store account with local signup first!",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standart = {
    code: HttpCode.INTERNAL_SEVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}

export default Errors;
