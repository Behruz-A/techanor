import { Request, Response } from "express";
import OrderService from "../models/Order.service";
import Errors, { HttpCode, Message } from "../libs/Error";
import { OrderStatus } from "../libs/enums/order.enum";
import { OrderCreateInput, OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { T } from "../libs/types/common";
import { MemberType } from "../libs/enums/member.enum";

const orderService = new OrderService();
const orderController: T = {};

const getMemberId = (req: Request): string => {
  const member = (req.session as T).member;
  const memberId = member?._id;
  if (!memberId || member.memberType !== MemberType.USER)
    throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
  return String(memberId);
};
const handleError = (res: Response, err: unknown) => {
  if (err instanceof Errors) return res.status(err.code).json(err);
  return res.status(Errors.standart.code).json(Errors.standart);
};

orderController.createOrder = async (req: Request, res: Response) => {
  try {
    const result = await orderService.createOrder(getMemberId(req), req.body as OrderCreateInput);
    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, createOrder:", err);
    handleError(res, err);
  }
};

orderController.getMyOrders = async (req: Request, res: Response) => {
  try {
    const inquiry: OrderInquiry = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
    };
    if (req.query.orderStatus)
      inquiry.orderStatus = req.query.orderStatus as OrderStatus;
    const result = await orderService.getMyOrders(getMemberId(req), inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyOrders:", err);
    handleError(res, err);
  }
};

orderController.updateOrder = async (req: Request, res: Response) => {
  try {
    const result = await orderService.updateOrder(getMemberId(req), req.body as OrderUpdateInput);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateOrder:", err);
    handleError(res, err);
  }
};

export default orderController;
