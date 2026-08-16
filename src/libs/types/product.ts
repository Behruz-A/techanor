import { ObjectId } from "mongoose";
import {
  ProductCategory,
  ProductBrand,
  ProductCondition,
  ProductStatus,
  ProductMemory,
  ProductScreenSize,
} from "../enums/product.enum";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productName: string;
  productSku?: string;
  productPrice: number;
  productLeftCount: number;
  productCondition?: ProductCondition;
  productCategory?: ProductCategory;
  productBrand?: ProductBrand;
  productMemory?: ProductMemory;
  productScreenSize?: ProductScreenSize;
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
  productBrand?: ProductBrand;
  productMemory?: ProductMemory;
  productScreenSize?: ProductScreenSize;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCondition?: ProductCondition;
  productMemory?: ProductMemory;
  productScreenSize?: ProductScreenSize;
  productCategory?: ProductCategory;
  productBrand?: ProductBrand;
  productName: string;
  productSku?: string;
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
  productMemory?: ProductMemory;
  productScreenSize?: ProductScreenSize;
  productCategory?: ProductCategory;
  productBrand?: ProductBrand;
  productName?: string;
  productSku?: string;
  productPrice?: number;
  productLeftCount?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}
