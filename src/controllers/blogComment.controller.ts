import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Error";
import BlogCommentService from "../models/blogComment.service";
import { BlogCommentInput } from "../libs/types/blogComment";

const blogCommentService = new BlogCommentService();

const getComments = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);
    const inquiry = {
      page: Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1,
      limit: Number.isSafeInteger(limitValue) && limitValue > 0 ? Math.min(50, limitValue) : 20,
    };
    const result = await blogCommentService.getComments(req.params.id, inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

const createComment = async (req: Request<{ id: string }, unknown, BlogCommentInput>, res: Response) => {
  try {
    const result = await blogCommentService.createComment(req.params.id, req.body || {});
    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default { getComments, createComment };
