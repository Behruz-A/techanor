import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";
import productController from "./controllers/product.controlle";
import blogController from "./controllers/blog.controller";
import { makeAvatarUploader, makeBlogUploader, makeProductUploader } from "./libs/utils/uploader";
import { Request, Response, NextFunction } from "express";
import { Message } from "./libs/Error";

const productUpload = makeProductUploader("products").array("productImages", 5);
const handleProductUpload = (req: Request, res: Response, next: NextFunction) => {
  productUpload(req, res, (err) => {
    if (!err) return next();
    const message = JSON.stringify(err.message || Message.INVALID_PRODUCT_IMAGE);
    return res.status(400).send(
      `<script>alert(${message});window.location.replace('/admin/product/all')</script>`,
    );
  });
};

/**STORE */
routerAdmin.get("/", storeController.goHome);

routerAdmin
  .get("/login", storeController.getLogin)
  .post("/login", storeController.processLogin);

routerAdmin
  .get("/signup", storeController.getSignup)
  .post(
    "/signup",
    makeAvatarUploader("members").single("memberImage"),
    storeController.processSignup,
  );
routerAdmin.get("/logout", storeController.logout);
routerAdmin.get(
  "/marketing",
  storeController.verifyStore,
  storeController.getMarketing,
);
routerAdmin.get(
  "/analytics",
  storeController.verifyStore,
  storeController.getAnalytics,
);
routerAdmin.get("/check-me", storeController.checkAuthSession);
routerAdmin.post("/auth/google", storeController.processGoogleAuth);

/**PRODUCT*/
routerAdmin.get(
  "/product/all",
  storeController.verifyStore,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  storeController.verifyStore,
  handleProductUpload,
  productController.createNewProduct,
);
routerAdmin.post(
  "/product/:id",
  storeController.verifyStore,
  productController.updateChosenProduct,
);
routerAdmin.delete(
  "/product/:id",
  storeController.verifyStore,
  productController.deleteChosenProduct,
);

/**BLOG */
routerAdmin.get(
  "/blog/all",
  storeController.verifyStore,
  blogController.getAllBlogs,
);
routerAdmin.get(
  "/blog/create",
  storeController.verifyStore,
  blogController.getCreateBlog,
);
routerAdmin.post(
  "/blog/create",
  storeController.verifyStore,
  makeBlogUploader("blogs").fields([
    { name: "blogPostImage", maxCount: 1 },
    { name: "blogPostVideo", maxCount: 1 },
  ]),
  blogController.createBlog,
);
routerAdmin.post(
  "/blog/:id",
  storeController.verifyStore,
  blogController.updateBlog,
);

/**USER */
routerAdmin.get(
  "/user/all",
  storeController.verifyStore,
  storeController.getUsers,
);
routerAdmin.post(
  "/user/edit",
  storeController.verifyStore,
  storeController.updateChosenUser,
);

export default routerAdmin;
