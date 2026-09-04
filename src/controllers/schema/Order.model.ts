import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../../libs/enums/order.enum";

const orderSchema = new Schema(
  {
    orderTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    orderDelivery: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PAUSE,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    deliveryAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      note: { type: String, trim: true, default: "" },
    },

    deliveryMethod: {
      type: String,
      enum: ["STANDARD", "EXPRESS"],
      required: true,
      default: "STANDARD",
    },
  },
  { timestamps: true, collection: "orders" },
);

orderSchema.index({ memberId: 1, orderStatus: 1, updatedAt: -1 });

export default mongoose.model("Order", orderSchema);
