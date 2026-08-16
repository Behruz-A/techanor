import BlogPostModel from "../controllers/schema/BlogPost.model";
import Errors, { HttpCode, Message } from "../libs/Error";
import { shapeIntoMongooseObjectId } from "../libs/config";
import {
  BlogPost,
  BlogPostInput,
  BlogPostUpdateInput,
} from "../libs/types/blog";

class BlogService {
  private readonly blogPostModel;

  constructor() {
    this.blogPostModel = BlogPostModel;
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
    const result = await this.blogPostModel
      .findOneAndUpdate({ _id: blogId }, input, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default BlogService;
