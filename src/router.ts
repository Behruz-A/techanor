import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import productController from "./controllers/product.controlle";
import blogController from "./controllers/blog.controller";

router.post("/login", memberController.login);

router.get("/member/me", memberController.getCurrentMember);

router.post("/logout", memberController.logout);

router.post("/signup", memberController.signup);

router.get("/product/all", productController.getProducts);

router.get("/product/:id", productController.getProduct);

router.get("/blog/all", blogController.getPublishedBlogs);

router.get("/blog/:id", blogController.getPublishedBlog);

export default router;
