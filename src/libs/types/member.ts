import { Request } from "express";
import { Session } from "express-session";
import { ObjectId } from "mongoose";
import {
  AuthProvider,
  MemberStatus,
  MemberType,
} from "../enums/member.enum";
import multer from "multer";

export interface Member {
  _id: ObjectId;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword?: string;
  memberEmail?: string;
  googleId?: string;
  authProvider?: AuthProvider;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberInput {
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberEmail?: string;
  googleId?: string;
  authProvider?: AuthProvider;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints?: number;
}

export interface MemberUpdateInput {
  _id: ObjectId;

  memberStatus?: MemberStatus;
  memberNick?: string;
  memberPhone?: string;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface ExtendedRequest extends Request {
  member: Member;

  file: Express.Multer.File;
  files: Express.Multer.File[];
}

export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member: Member };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
