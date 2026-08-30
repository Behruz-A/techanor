import { shapeIntoMongooseObjectId } from "../libs/config";
import ProductModel from "../controllers/schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import { T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ViewService from "./View.service";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /* SPA */

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCondition)
      match.productCondition = inquiry.productCondition;
    if (inquiry.productCategory) match.productCategory = inquiry.productCategory;
    if (inquiry.productBrand) match.productBrand = inquiry.productBrand;
    if (inquiry.productMemory) match.productMemory = inquiry.productMemory;
    if (inquiry.productScreenSize)
      match.productScreenSize = inquiry.productScreenSize;
    if (inquiry.search)
      match.productName = { $regex: new RegExp(inquiry.search, "i") };

    const allowedOrders = ["createdAt", "productPrice", "productViews"];
    const order = allowedOrders.includes(inquiry.order)
      ? inquiry.order
      : "createdAt";
    const sort: T =
      order === "productPrice" ? { [order]: 1 } : { [order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
      ])
      .exec();

    return result;
  }

  public async getProduct(id: string): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: productId, productStatus: ProductStatus.PROCESS },
        { $inc: { productViews: 1 } },
        { new: true },
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  /*SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async deleteChosenProduct(id: string): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
}

export default ProductService;
