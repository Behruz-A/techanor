import { ObjectId } from "mongoose";
import {
  ProductCategory,
  ProductCondition,
  ProductStatus,
} from "../enums/product.enum";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productCondition?: ProductCondition;
  productCategory?: ProductCategory;
  productDesc?: string;
  productImages: string[];
  productViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCondition?: ProductCondition;
  productCategory?: ProductCategory;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCondition?: ProductCondition;
  productCategory?: ProductCategory;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCondition?: ProductCondition;
  productCategory?: ProductCategory;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}
