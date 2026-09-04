import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";
import app from "./app";

const mongoUrl = process.env.MONGO_URL_TECH?.trim();
if (!mongoUrl) throw new Error("MONGO_URL_TECH is required");

mongoose
  .connect(mongoUrl, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3001;
    app.listen(PORT, function () {
      console.log(`The server is successfully running on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.error("Error on connection MongoDB", err);
    process.exitCode = 1;
  });
