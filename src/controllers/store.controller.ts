import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../models/Member.service";

const storeController: T = {};
storeController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
  } catch (err) {
    console.log("Error, goHome:", err);
  }
  res.send("Welcome to Home Page");
};

storeController.getLogin = (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.log("Error, getLogin:", err);
  }
  res.send("Login Page");
};

storeController.getSignup = (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.log("Error, getSignup :", err);
  }
  res.send("Signup Page");
};

export default storeController;
