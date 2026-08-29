import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import productController from "./controllers/product.controlle";

router.post("/login", memberController.login);

router.post("/signup", memberController.signup);

router.get("/product/all", productController.getProducts);

export default router;
