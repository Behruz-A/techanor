import express from "express";
import path from "path";

/**1-Entrance */

const app = express();
console.log("__dirname:", __dirname);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**1-Sessions */

/**1- Views*/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**1-Routers*/

export default app;
