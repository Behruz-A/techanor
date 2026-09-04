import mongoose, { Schema } from "mongoose";

import {
  BlogPostStatus,
  BlogPostCategory,
} from "../../libs/enums/blogPost.enum";

const blogPostSchema = new Schema(
  {
    blogPostStatus: {
      type: String,
      enum: BlogPostStatus,
      default: BlogPostStatus.DRAFT,
    },

    blogPostCategory: {
      type: String,
      enum: BlogPostCategory,
      required: true,
    },
    blogPostTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180,
    },
    blogPostContent: {
      type: String,
      required: true,
      trim: true,
      minlength: 40,
      maxlength: 50000,
    },

    blogPostImage: {
      type: String,
    },
    blogPostVideo: {
      type: String,
    },
    blogPostVideoUrl: {
      type: String,
      trim: true,
    },

    blogPostViews: {
      type: Number,
      default: 0,
    },
    //Soon
    blogPostLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: "blogPosts" },
);

export default mongoose.model("BlogPost", blogPostSchema);
