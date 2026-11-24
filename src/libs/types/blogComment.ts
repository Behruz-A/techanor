import { Types } from "mongoose";

export interface BlogComment {
  _id: Types.ObjectId;
  blogPostId: Types.ObjectId;
  parentId: Types.ObjectId | null;
  name: string;
  content: string;
  createdAt: Date;
}

export interface BlogCommentRecord extends BlogComment {
  email: string;
  website?: string;
  updatedAt: Date;
}

export interface BlogCommentInput {
  name: string;
  email: string;
  content: string;
  website?: string;
  parentId?: string;
}

export interface BlogCommentInquiry {
  page: number;
  limit: number;
}

export interface BlogCommentList {
  list: BlogComment[];
  total: number;
}
