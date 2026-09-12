import { Types } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItemInput {
  itemQuantity: number;
  productId: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  note?: string;
}

export interface OrderCreateInput {
  items: OrderItemInput[];
  deliveryAddress: DeliveryAddress;
  deliveryMethod: "STANDARD" | "EXPRESS";
}

export interface OrderItem {
  _id: Types.ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: Types.ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: Types.ObjectId;
  deliveryAddress: DeliveryAddress;
  deliveryMethod: "STANDARD" | "EXPRESS";
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
  productData?: Product[];
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}
