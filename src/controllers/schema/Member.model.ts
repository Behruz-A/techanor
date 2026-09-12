import mongoose, { Schema } from "mongoose";
import {
  AuthProvider,
  MemberStatus,
  MemberType,
} from "../../libs/enums/member.enum";
import { Member } from "../../libs/types/member";

const memberSchema = new Schema<Member>(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
    },

    memberEmail: {
      type: String,
      index: { unique: true, sparse: true },
      lowercase: true,
      trim: true,
    },

    googleId: {
      type: String,
      index: { unique: true, sparse: true },
    },

    authProvider: {
      type: String,
      enum: AuthProvider,
      default: AuthProvider.LOCAL,
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }, // updatedAt & createdAt
);

export default mongoose.model<Member>("Member", memberSchema);
