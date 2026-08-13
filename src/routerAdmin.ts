import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";
import productController from "./controllers/product.controlle";

/**STORE */
routerAdmin.get("/", storeController.goHome);

routerAdmin
  .get("/login", storeController.getLogin)
  .post("/login", storeController.processLogin);

routerAdmin
  .get("/signup", storeController.getSignup)
  .post("/signup", storeController.processSignup);
routerAdmin.get("/logout", storeController.logout);
routerAdmin.get("/check-me", storeController.checkAuthSession);

/**PRODUCT*/
routerAdmin.get(
  "/product/all",
  storeController.verifyStore,
  productController.getAllProducts,
);
routerAdmin.post("/product/create", productController.createNewProduct);
routerAdmin.post("/product/:id", productController.createNewProduct);

/**USER */

export default routerAdmin;
