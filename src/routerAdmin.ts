import express from "express";
const routerAdmin = express.Router();
import storeController from "./controllers/store.controller";

routerAdmin.get("/", storeController.goHome);

routerAdmin.get("/login", storeController.getLogin);

routerAdmin.get("/signup", storeController.getSignup);

export default routerAdmin;
