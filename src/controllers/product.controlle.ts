import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Error";
import { T } from "../libs/types/common";
import ProductService from "../models/product.service";
import fs from "fs";
import { AdminRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import {
  ProductBrand,
  ProductCategory,
  ProductCondition,
  ProductMemory,
  ProductScreenSize,
} from "../libs/enums/product.enum";

const productService = new ProductService();

const productController: T = {};

/* SPA */

productController.getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      order,
      productCondition,
      productCategory,
      productBrand,
      productMemory,
      productScreenSize,
      search,
    } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order || "createdAt"),
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(50, Math.max(1, Number(limit) || 8)),
    };

    if (productCondition)
      inquiry.productCondition = productCondition as ProductCondition;
    if (productCategory)
      inquiry.productCategory = productCategory as ProductCategory;
    if (productBrand) inquiry.productBrand = productBrand as ProductBrand;
    if (productMemory) inquiry.productMemory = productMemory as ProductMemory;
    if (productScreenSize)
      inquiry.productScreenSize = productScreenSize as ProductScreenSize;
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.getProduct = async (req: Request, res: Response) => {
  try {
    const result = await productService.getProduct(req.params.id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

/*SSR */

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    const data = await productService.getAllProducts();

    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    if (!req.files?.length)
      throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_IMAGE_REQUIRED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    await productService.createNewProduct(data);

    res.status(HttpCode.CREATED).send(
      `<script> alert("Successful creation!"); window.location.replace('/admin/product/all') </script>`,
    );
  } catch (err) {
    if (req.files?.length) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.status(err instanceof Errors ? err.code : HttpCode.BAD_REQUEST).send(
      `<script> alert("${message}"); window.location.replace('/admin/product/all') </script>`,
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await productService.updateChosenProduct(
      id as string,
      req.body,
    );

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.deleteChosenProduct = async (req: Request, res: Response) => {
  try {
    const result = await productService.deleteChosenProduct(req.params.id as string);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, deleteChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default productController;
