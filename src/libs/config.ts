export const AUTH_TIMER = 24;

export const MORGAN_FORMAT = `:method :url :response-time [:status] \n`;

import mongoose from "mongoose";
import Errors, { HttpCode, Message } from "./Error";
export const shapeIntoMongooseObjectId = (target: any) => {
  if (!mongoose.isValidObjectId(target))
    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ID);
  return new mongoose.Types.ObjectId(String(target));
};
