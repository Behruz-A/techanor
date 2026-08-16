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
    },
    blogPostContent: {
      type: String,
      required: true,
      trim: true,
    },

    blogPostImage: {
      type: String,
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
