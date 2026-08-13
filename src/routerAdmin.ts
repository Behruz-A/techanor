import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";
import productController from "./controllers/product.controlle";
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
routerAdmin.get("/check-me", storeController.checkAuthSession);

/**PRODUCT*/
routerAdmin.get(
  "/product/all",
  storeController.verifyStore,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  storeController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct,
);
routerAdmin.post(
  "/product/:id",
  storeController.verifyStore,
  productController.createNewProduct,
);

/**USER */

export default routerAdmin;
