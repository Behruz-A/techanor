import mongoose from "mongoose";
import OrderModel from "../controllers/schema/Order.model";
import OrderItemModel from "../controllers/schema/OrderItems.model";
import ProductModel from "../controllers/schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import { DeliveryAddress, Order, OrderCreateInput, OrderInquiry, OrderUpdateInput } from "../libs/types/order";

const FREE_DELIVERY_THRESHOLD = 79;
const STANDARD_DELIVERY_COST = 5;
const EXPRESS_DELIVERY_COST = 12;
const MAX_ORDER_ITEMS = 50;

class OrderService {
  public async createOrder(memberId: string, input: OrderCreateInput): Promise<Order> {
    const items = input?.items;
    const deliveryAddress = this.validateDeliveryAddress(input?.deliveryAddress);
    const deliveryMethod = input?.deliveryMethod;
    if (!mongoose.isValidObjectId(memberId) || !Array.isArray(items) || items.length === 0 || items.length > MAX_ORDER_ITEMS || !["STANDARD", "EXPRESS"].includes(deliveryMethod)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      const productId = String(item?.productId || "");
      const quantity = Number(item?.itemQuantity);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const productIds = [...quantities.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const products = await ProductModel.find({ _id: { $in: productIds }, productStatus: ProductStatus.PROCESS }).lean().exec();
    if (products.length !== productIds.length) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);

    const preparedItems = products.map((product) => {
      const itemQuantity = quantities.get(String(product._id)) || 0;
      if (product.productLeftCount < itemQuantity) throw new Errors(HttpCode.CONFLICT, Message.INSUFFICIENT_STOCK);
      return { productId: product._id, itemQuantity, itemPrice: product.productPrice };
    });
    const subtotal = preparedItems.reduce((total, item) => total + item.itemPrice * item.itemQuantity, 0);
    const delivery = deliveryMethod === "EXPRESS" ? EXPRESS_DELIVERY_COST : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_COST;
    const decremented: Array<{ productId: mongoose.Types.ObjectId; quantity: number }> = [];
    let createdOrderId: mongoose.Types.ObjectId | null = null;

    try {
      for (const item of preparedItems) {
        const updated = await ProductModel.findOneAndUpdate(
          { _id: item.productId, productStatus: ProductStatus.PROCESS, productLeftCount: { $gte: item.itemQuantity } },
          { $inc: { productLeftCount: -item.itemQuantity } },
          { new: true },
        ).exec();
        if (!updated) throw new Errors(HttpCode.CONFLICT, Message.INSUFFICIENT_STOCK);
        decremented.push({ productId: item.productId, quantity: item.itemQuantity });
      }

      const order = await OrderModel.create({
        orderTotal: subtotal + delivery,
        orderDelivery: delivery,
        memberId: new mongoose.Types.ObjectId(memberId),
        deliveryAddress,
        deliveryMethod,
      });
      createdOrderId = order._id;
      await OrderItemModel.insertMany(preparedItems.map((item) => ({ ...item, orderId: order._id })));
      return order.toObject() as Order;
    } catch (err) {
      if (createdOrderId) {
        await OrderItemModel.deleteMany({ orderId: createdOrderId }).exec();
        await OrderModel.deleteOne({ _id: createdOrderId }).exec();
      }
      if (decremented.length) {
        await ProductModel.bulkWrite(decremented.map((item) => ({
          updateOne: { filter: { _id: item.productId }, update: { $inc: { productLeftCount: item.quantity } } },
        })));
      }
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  private validateDeliveryAddress(input?: DeliveryAddress): DeliveryAddress {
    if (!input) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
    const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
    const address: DeliveryAddress = {
      fullName: clean(input.fullName, 80),
      phone: clean(input.phone, 30),
      country: clean(input.country, 60),
      city: clean(input.city, 60),
      address: clean(input.address, 160),
      postalCode: clean(input.postalCode, 20),
      note: clean(input.note, 300),
    };
    if (!address.fullName || !address.phone || !address.country || !address.city || !address.address || !address.postalCode) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
    }
    return address;
  }

  public async getMyOrders(memberId: string, inquiry: OrderInquiry): Promise<Order[]> {
    if (!mongoose.isValidObjectId(memberId) || (inquiry.orderStatus && !Object.values(OrderStatus).includes(inquiry.orderStatus))) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
    }
    const match: Record<string, unknown> = {
      memberId: new mongoose.Types.ObjectId(memberId),
    };
    if (inquiry.orderStatus) match.orderStatus = inquiry.orderStatus;
    return OrderModel.aggregate([
      { $match: match },
      { $sort: { updatedAt: -1 } },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit },
      { $lookup: { from: "orderItems", localField: "_id", foreignField: "orderId", as: "orderItems" } },
      { $lookup: { from: "products", localField: "orderItems.productId", foreignField: "_id", as: "productData" } },
    ]).exec();
  }

  public async updateOrder(memberId: string, input: OrderUpdateInput): Promise<Order> {
    if (!mongoose.isValidObjectId(memberId) || !mongoose.isValidObjectId(input.orderId)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
    }
    const order = await OrderModel.findOne({ _id: input.orderId, memberId }).exec();
    if (!order) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const allowed = order.orderStatus === OrderStatus.PAUSE
      ? [OrderStatus.PROCESS, OrderStatus.DELETE]
      : order.orderStatus === OrderStatus.PROCESS ? [OrderStatus.FINISH] : [];
    if (!allowed.includes(input.orderStatus)) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_STATUS);

    if (input.orderStatus === OrderStatus.DELETE) {
      const items = await OrderItemModel.find({ orderId: order._id }).lean().exec();
      if (items.length) {
        await ProductModel.bulkWrite(items.map((item) => ({
          updateOne: { filter: { _id: item.productId }, update: { $inc: { productLeftCount: item.itemQuantity } } },
        })));
      }
    }
    order.orderStatus = input.orderStatus;
    await order.save();
    return order.toObject() as Order;
  }
}

export default OrderService;
