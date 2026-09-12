import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";
import app from "./app";
import type { Server } from "http";

const mongoUrl = process.env.MONGO_URL_TECH?.trim();
if (!mongoUrl) throw new Error("MONGO_URL_TECH is required");

mongoose.set("strictQuery", true);

let server: Server | undefined;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3001;
    server = app.listen(PORT, function () {
      console.log(`The server is successfully running on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.error("Error on connection MongoDB", err);
    process.exitCode = 1;
  });

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  const finish = async () => {
    await mongoose.disconnect();
    process.exit(0);
  };
  if (server) server.close(() => void finish());
  else void finish();
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
