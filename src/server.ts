import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URL_TECH as string, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3001;
  })
  .catch((err) => console.log("Error on connection MongoDB", err));
