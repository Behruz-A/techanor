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
  INVALID_ID = "The supplied identifier is invalid!",
  CREATION_FAILED = "Creation failed!",
  PRODUCT_NAME_REQUIRED = "Product name is required!",
  PRODUCT_NAME_USED = "A product with this name already exists!",
  INVALID_PRODUCT_PRICE = "Product price must be zero or greater!",
  INVALID_PRODUCT_STOCK = "Product stock must be a whole number of zero or greater!",
  PRODUCT_IMAGE_REQUIRED = "Upload at least one product image!",
  INVALID_PRODUCT_IMAGE = "Product images must be JPG, PNG, or WebP files up to 5 MB!",
  INVALID_BLOG_CATEGORY = "Blog category is invalid!",
  UPDATE_FAILED = "Update is failed!",
  INVALID_ORDER = "Order information is invalid!",
  INSUFFICIENT_STOCK = "One or more products do not have enough stock!",
  INVALID_ORDER_STATUS = "This order status change is not allowed!",

  USED_NICK_PHONE = "You are inserting already used nick or phone!",
  INVALID_MEMBER_NICK = "Username must be 2 to 30 characters and use only letters, numbers, or underscores!",
  INVALID_MEMBER_PHONE = "Enter a valid phone number containing 7 to 15 digits!",
  INVALID_MEMBER_PASSWORD = "Password must be between 6 and 72 characters!",
  PASSWORD_MISMATCH = "Password confirmation does not match!",
  INVALID_LOGIN_INPUT = "Username and password are required!",
  NO_MEMBER_NICK = "No member with that member nick!",
  BLOCKED_USER = "You have been blocked, contact the Admin",
  WRONG_PASSWORD = "Wrong password, please try again!",
  NOT_AUTHENTICATED = "You are not authenticated. Please log in first!",
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
    super(statusMessage);
    this.name = "ApplicationError";
    this.code = statusCode;
    this.message = statusMessage;
  }

  public toJSON() {
    return { code: this.code, message: this.message };
  }
}

export default Errors;
