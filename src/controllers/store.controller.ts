import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../models/Member.service";

const storeController: T = {};
storeController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.send("Welcome to Home Page");
  } catch (err) {
    console.log("Error, goHome:", err);
  }
};

storeController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.send("Login Page");
  } catch (err) {
    console.log("Error, getLogin:", err);
  }
};

storeController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.send("Signup Page");
  } catch (err) {
    console.log("Error, getSignup :", err);
  }
};

storeController.processLogin = (req: Request, res: Response) => {
  try {
    console.log("processLogin ");
    res.send("DONE");
  } catch (err) {
    console.log("Error, processLogin  :", err);
  }
};

storeController.processSignup = (req: Request, res: Response) => {
  try {
    console.log("processSignup");
    res.send("DONE");
  } catch (err) {
    console.log("Error, processSignup  :", err);
  }
};
export default storeController;
