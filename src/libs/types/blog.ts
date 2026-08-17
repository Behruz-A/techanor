import { ObjectId } from "mongoose";
import {
  BlogPostCategory,
  BlogPostStatus,
} from "../enums/blogPost.enum";

export interface BlogPost {
  _id: ObjectId;
  blogPostStatus: BlogPostStatus;
  blogPostCategory: BlogPostCategory;
  blogPostTitle: string;
  blogPostContent: string;
  blogPostImage?: string;
  blogPostVideo?: string;
  blogPostVideoUrl?: string;
  blogPostViews: number;
  blogPostLikes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostInput {
  blogPostStatus?: BlogPostStatus;
  blogPostCategory: BlogPostCategory;
  blogPostTitle: string;
  blogPostContent: string;
  blogPostImage?: string;
  blogPostVideo?: string;
  blogPostVideoUrl?: string;
  blogPostViews?: number;
  blogPostLikes?: number;
}

export interface BlogPostUpdateInput {
  blogPostStatus?: BlogPostStatus;
  blogPostCategory?: BlogPostCategory;
  blogPostTitle?: string;
  blogPostContent?: string;
  blogPostImage?: string;
  blogPostVideo?: string;
  blogPostVideoUrl?: string;
}
