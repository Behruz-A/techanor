import BlogCommentModel from "../controllers/schema/BlogComment.model";
import BlogPostModel from "../controllers/schema/BlogPost.model";
import Errors, { HttpCode, Message } from "../libs/Error";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { BlogPostStatus } from "../libs/enums/blogPost.enum";
import { BlogComment, BlogCommentInput, BlogCommentInquiry, BlogCommentList } from "../libs/types/blogComment";

class BlogCommentService {
  private readonly blogCommentModel;
  private readonly blogPostModel;

  constructor() {
    this.blogCommentModel = BlogCommentModel;
    this.blogPostModel = BlogPostModel;
  }

  private async getPublishedBlogId(id: string) {
    const blogPostId = shapeIntoMongooseObjectId(id);
    const post = await this.blogPostModel.exists({ _id: blogPostId, blogPostStatus: BlogPostStatus.PUBLISHED });
    if (!post) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return blogPostId;
  }

  public async getComments(id: string, inquiry: BlogCommentInquiry): Promise<BlogCommentList> {
    const blogPostId = await this.getPublishedBlogId(id);
    const match = { blogPostId };
    const [list, total] = await Promise.all([
      this.blogCommentModel.find(match).select("_id blogPostId parentId name content createdAt")
        .sort({ createdAt: 1, _id: 1 }).skip((inquiry.page - 1) * inquiry.limit).limit(inquiry.limit).exec(),
      this.blogCommentModel.countDocuments(match).exec(),
    ]);
    return { list, total };
  }

  public async createComment(id: string, input: BlogCommentInput): Promise<BlogComment> {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const content = typeof input.content === "string" ? input.content.trim() : "";
    const website = typeof input.website === "string" ? input.website.trim() : "";
    if (name.length < 2 || name.length > 80 || content.length < 2 || content.length > 3000 ||
        email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || website.length > 500) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_BLOG_COMMENT);
    }
    if (website) {
      try {
        const url = new URL(website);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Invalid website");
      } catch {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_BLOG_COMMENT);
      }
    }
    const blogPostId = await this.getPublishedBlogId(id);
    const parentId = input.parentId ? shapeIntoMongooseObjectId(input.parentId) : null;
    if (parentId) {
      const parent = await this.blogCommentModel.exists({ _id: parentId, blogPostId, parentId: null });
      if (!parent) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_BLOG_COMMENT);
    }
    const result = await this.blogCommentModel.create({ blogPostId, parentId, name, email, content, website: website || undefined });
    return {
      _id: result._id, blogPostId: result.blogPostId, parentId: result.parentId,
      name: result.name, content: result.content, createdAt: result.createdAt,
    };
  }
}

export default BlogCommentService;
