import mongoose, { Schema } from "mongoose";

import {
  ProductStatus,
  ProductCondition,
  ProductCategory,
  ProductBrand,
  ProductMemory,
  ProductScreenSize,
} from "../../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },
    productCategory: {
      type: String,
      enum: ProductCategory,
      required: true,
    },
    productBrand: {
      type: String,
      enum: ProductBrand,
      default: ProductBrand.OTHER,
    },
    productMemory: {
      type: String,
      enum: ProductMemory,
    },
    productScreenSize: {
      type: String,
      enum: ProductScreenSize,
    },

    productCondition: {
      type: String,
      enum: ProductCondition,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 64,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productLeftCount: {
      type: Number,
      required: true,
    },
    productDesc: {
      type: String,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true },
);
productSchema.index({ productName: 1 }, { unique: true });
export default mongoose.model("Product", productSchema);
