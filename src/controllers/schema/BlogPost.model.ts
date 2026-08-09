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
    },
    blogPostContent: {
      type: String,
    },

    blogPostImage: {
      type: String,
    },

    blogPostViews: {
      type: Number,
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
