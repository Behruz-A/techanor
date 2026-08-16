import { Request, Response } from "express";
import Errors from "../libs/Error";
import { T } from "../libs/types/common";
import BlogService from "../models/blog.service";
import fs from "fs";
import { AdminRequest } from "../libs/types/member";
import { BlogPostInput } from "../libs/types/blog";

const blogService = new BlogService();
const blogController: T = {};

blogController.getAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.render("blogs", { blogs });
  } catch (err) {
    console.log("Error, getAllBlogs:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

blogController.getCreateBlog = (_req: Request, res: Response) => {
  res.render("blog-create");
};

blogController.createBlog = async (req: AdminRequest, res: Response) => {
  try {
    const input: BlogPostInput = req.body;
    if (req.file) input.blogPostImage = req.file.path.replace(/\\/g, "/");

    await blogService.createBlog(input);
    res.redirect("/admin/blog/all");
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.log("Error, createBlog:", err);
    const message =
      err instanceof Errors ? err.message : "Blog could not be created";
    res.status(err instanceof Errors ? err.code : 500).render("blog-create", {
      error: message,
      formData: req.body,
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
