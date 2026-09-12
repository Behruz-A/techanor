import BlogPostModel from "../controllers/schema/BlogPost.model";
import Errors, { HttpCode, Message } from "../libs/Error";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { BlogPostStatus } from "../libs/enums/blogPost.enum";
import { T } from "../libs/types/common";
import {
  BlogPost,
  BlogPostInquiry,
  BlogPostInput,
  BlogPostUpdateInput,
} from "../libs/types/blog";

class BlogService {
  private readonly blogPostModel;

  constructor() {
    this.blogPostModel = BlogPostModel;
  }

  public async getPublishedBlogs(inquiry: BlogPostInquiry): Promise<BlogPost[]> {
    const match: T = { blogPostStatus: BlogPostStatus.PUBLISHED };
    if (inquiry.blogPostCategory) match.blogPostCategory = inquiry.blogPostCategory;
    if (inquiry.search) {
      const escapedSearch = inquiry.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const search = new RegExp(escapedSearch, "i");
      match.$or = [{ blogPostTitle: search }, { blogPostContent: search }];
    }

    return this.blogPostModel
      .find(match)
      .sort({ createdAt: -1 })
      .skip((inquiry.page - 1) * inquiry.limit)
      .limit(inquiry.limit)
      .exec();
  }

  public async getPublishedBlog(id: string): Promise<BlogPost> {
    const blogId = shapeIntoMongooseObjectId(id);
    const result = await this.blogPostModel
      .findOneAndUpdate(
        { _id: blogId, blogPostStatus: BlogPostStatus.PUBLISHED },
        { $inc: { blogPostViews: 1 } },
        { new: true },
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getAllBlogs(): Promise<BlogPost[]> {
    const result = await this.blogPostModel.find().sort({ createdAt: -1 }).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createBlog(input: BlogPostInput): Promise<BlogPost> {
    try {
      return await this.blogPostModel.create(input);
    } catch (err) {
      console.log("Error, model:createBlog:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async updateBlog(
    id: string,
    input: BlogPostUpdateInput,
  ): Promise<BlogPost> {
    const blogId = shapeIntoMongooseObjectId(id);
    const allowedFields: Array<keyof BlogPostUpdateInput> = [
      "blogPostStatus", "blogPostCategory", "blogPostTitle",
      "blogPostContent", "blogPostImage", "blogPostVideo", "blogPostVideoUrl",
    ];
    const update = Object.fromEntries(
      allowedFields
        .filter((field) => input[field] !== undefined)
        .map((field) => [field, input[field]]),
    );
    if (!Object.keys(update).length)
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    const result = await this.blogPostModel
      .findOneAndUpdate({ _id: blogId }, { $set: update }, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);
    return result;
  }
}

export default BlogService;
