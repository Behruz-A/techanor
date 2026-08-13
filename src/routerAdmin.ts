import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";

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
/**USER */

export default routerAdmin;
