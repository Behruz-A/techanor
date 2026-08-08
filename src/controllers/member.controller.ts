import { T } from "../libs/types/common";
import { Request, Response } from "express";

const memberController: T = {};
memberController.goHome = (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.log("Error, goHome:", err);
  }
  res.send("Welcome to Home Page");
};

memberController.getLogin = (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.log("Error, getLogin:", err);
  }
  res.send("Login Page");
};

memberController.getSignup = (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.log("Error, getSignup :", err);
  }
  res.send("Signup Page");
};

export default memberController;
