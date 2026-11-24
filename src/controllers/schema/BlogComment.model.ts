import mongoose, { Schema } from "mongoose";
import { BlogCommentRecord } from "../../libs/types/blogComment";

const blogCommentSchema = new Schema<BlogCommentRecord>(
  {
    blogPostId: { type: Schema.Types.ObjectId, ref: "BlogPost", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "BlogComment", default: null },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, select: false },
    website: { type: String, trim: true, maxlength: 500, select: false },
    content: { type: String, required: true, trim: true, minlength: 2, maxlength: 3000 },
  },
  { timestamps: true, collection: "blogComments" },
);

blogCommentSchema.index({ blogPostId: 1, createdAt: 1, _id: 1 });

export default mongoose.model<BlogCommentRecord>("BlogComment", blogCommentSchema);
