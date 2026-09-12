import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import productController from "./controllers/product.controlle";
import orderController from "./controllers/order.controller";
import blogController from "./controllers/blog.controller";
import { makeAvatarUploader } from "./libs/utils/uploader";

router.post("/login", memberController.login);

router.get("/member/me", memberController.getCurrentMember);

router.post("/member/update", makeAvatarUploader("members").single("memberImage"), memberController.updateMember);

router.post("/logout", memberController.logout);

router.post("/signup", memberController.signup);

router.get("/product/all", productController.getProducts);

router.get("/product/best-sellers", productController.getBestSellers);

router.get("/product/:id", productController.getProduct);

router.get("/blog/all", blogController.getPublishedBlogs);

router.get("/blog/:id", blogController.getPublishedBlog);

router.post("/order/create", orderController.createOrder);

router.get("/order/all", orderController.getMyOrders);

router.post("/order/update", orderController.updateOrder);

export default router;
