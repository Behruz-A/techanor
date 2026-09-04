import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./routerAdmin";
import morgan from "morgan";
import cors from "cors";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";
import multer from "multer";
import Errors, { HttpCode, Message } from "./libs/Error";
import dns from "dns";

const mongoUrl = process.env.MONGO_URL_TECH?.trim();
if (!mongoUrl) throw new Error("MONGO_URL_TECH is required");
if (mongoUrl?.startsWith("mongodb+srv://")) {
  const configuredServers = String(process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (configuredServers.length) dns.setServers(configuredServers);
  else if (process.platform === "win32") dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: mongoUrl,
  collection: "sessions",
});
store.on("error", (error) => {
  console.error("Session store error:", error);
});

/**1-Entrance */

const app = express();
console.log("__dirname:", __dirname);
const projectRoot = process.cwd();
const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(projectRoot, "uploads"));
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
const staticOptions = process.env.NODE_ENV === "production"
  ? { maxAge: "7d", immutable: true }
  : undefined;
app.use(express.static(path.join(projectRoot, "src", "public"), staticOptions));
app.use("/uploads", express.static(uploadRoot, staticOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const productionOrigins = String(process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (process.env.NODE_ENV !== "production" || productionOrigins.length) {
  app.use(cors({
    credentials: true,
    origin: process.env.NODE_ENV === "production" ? productionOrigins : true,
  }));
}
app.use(morgan(MORGAN_FORMAT));

/**2-Sessions */
app.use(
  session({
    secret: (() => {
      const secret = process.env.SESSION_SECRET?.trim();
      if (!secret) throw new Error("SESSION_SECRET is required");
      return secret;
    })(),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6h
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    store: store,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

/**3- Views*/
app.set("views", path.join(projectRoot, "src", "views"));
app.set("view engine", "ejs");

/**4-Routers*/
app.get("/health", (_req, res) => {
  res.status(HttpCode.OK).json({ status: "ok" });
});
app.use("/admin", routerAdmin); // EJS
app.use("/", router); // REACT

app.use((req, res) => {
  res.status(HttpCode.NOT_FOUND).json({
    code: HttpCode.NOT_FOUND,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error:", err);
  if (res.headersSent) return;
  if (err instanceof multer.MulterError)
    return res.status(HttpCode.BAD_REQUEST).json({
      code: HttpCode.BAD_REQUEST,
      message: err.code === "LIMIT_FILE_SIZE" ? "Uploaded file is too large" : err.message,
    });
  if (err instanceof Errors)
    return res.status(err.code).json({ code: err.code, message: err.message });
  return res.status(HttpCode.INTERNAL_SEVER_ERROR).json({
    code: HttpCode.INTERNAL_SEVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  });
});

export default app;
