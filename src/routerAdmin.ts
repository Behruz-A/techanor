import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";
import productController from "./controllers/product.controlle";
import blogController from "./controllers/blog.controller";
import makeUploader from "./libs/utils/uploader";

/**STORE */
routerAdmin.get("/", storeController.goHome);

routerAdmin
  .get("/login", storeController.getLogin)
  .post("/login", storeController.processLogin);

routerAdmin
  .get("/signup", storeController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
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
  makeUploader("products").array("productImages", 5),
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
  makeUploader("blogs").single("blogPostImage"),
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
