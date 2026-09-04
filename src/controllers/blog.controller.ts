import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Error";
import { T } from "../libs/types/common";
import BlogService from "../models/blog.service";
import fs from "fs";
import { AdminRequest } from "../libs/types/member";
import { BlogPostInquiry, BlogPostInput } from "../libs/types/blog";
import { BlogPostCategory, BlogPostStatus } from "../libs/enums/blogPost.enum";

const blogService = new BlogService();
const blogController: T = {};
const blogCategories = Object.values(BlogPostCategory);
const blogStatuses = Object.values(BlogPostStatus);
const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[A-Za-z0-9_-]{6,}(?:[?&][^\s]*)?$/i;

/* SPA */

blogController.getPublishedBlogs = async (req: Request, res: Response) => {
  try {
    const inquiry: BlogPostInquiry = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 12)),
    };
    if (req.query.blogPostCategory) {
      const category = req.query.blogPostCategory as BlogPostCategory;
      if (!blogCategories.includes(category))
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_BLOG_CATEGORY);
      inquiry.blogPostCategory = category;
    }
    if (req.query.search) inquiry.search = String(req.query.search).trim();

    const result = await blogService.getPublishedBlogs(inquiry);
    res.status(200).json(result);
  } catch (err) {
    console.log("Error, getPublishedBlogs:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

blogController.getPublishedBlog = async (req: Request, res: Response) => {
  try {
    const result = await blogService.getPublishedBlog(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    console.log("Error, getPublishedBlog:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

const getBlogFiles = (req: AdminRequest) => {
  const files = req.files as unknown as Record<string, Express.Multer.File[]> | undefined;
  return {
    image: files?.blogPostImage?.[0],
    video: files?.blogPostVideo?.[0],
  };
};

const removeUploadedBlogFiles = (req: AdminRequest) => {
  const { image, video } = getBlogFiles(req);
  [image, video].forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  });
};

blogController.getAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.render("blogs", { blogs, blogCategories, blogStatuses });
  } catch (err) {
    console.log("Error, getAllBlogs:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

blogController.getCreateBlog = (_req: Request, res: Response) => {
  res.render("blog-create", { blogCategories, blogStatuses });
};

blogController.createBlog = async (req: AdminRequest, res: Response) => {
  try {
    const input: BlogPostInput = req.body;
    const { image, video } = getBlogFiles(req);
    const videoUrl = String(input.blogPostVideoUrl || "").trim();
    if (videoUrl && !youtubeUrlPattern.test(videoUrl)) {
      throw new Error("Enter a valid YouTube video link");
    }
    if (image && image.size > 5 * 1024 * 1024) throw new Error("Cover image must be 5 MB or smaller");
    if (video && video.size > 50 * 1024 * 1024) throw new Error("Video must be 50 MB or smaller");
    if (image) input.blogPostImage = image.path.replace(/\\/g, "/");
    if (video && !videoUrl) input.blogPostVideo = video.path.replace(/\\/g, "/");
    if (videoUrl) {
      input.blogPostVideoUrl = /^https?:\/\//i.test(videoUrl) ? videoUrl : `https://${videoUrl}`;
      if (video?.path && fs.existsSync(video.path)) fs.unlinkSync(video.path);
    }
    else delete input.blogPostVideoUrl;

    await blogService.createBlog(input);
    res.redirect("/admin/blog/all");
  } catch (err) {
    removeUploadedBlogFiles(req);
    console.log("Error, createBlog:", err);
    const message = err instanceof Error ? err.message : "Blog could not be created";
    res.status(err instanceof Errors ? err.code : 500).render("blog-create", {
      error: message,
      formData: req.body,
      blogCategories,
      blogStatuses,
    });
  }
};

blogController.updateBlog = async (req: Request, res: Response) => {
  try {
    const result = await blogService.updateBlog(req.params.id, req.body);
    res.status(200).json({ data: result });
  } catch (err) {
    console.log("Error, updateBlog:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default blogController;
