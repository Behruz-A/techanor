import { T } from "../libs/types/common";
import { Request, Response } from "express";
import { LoginInput, MemberInput } from "../libs/types/member";
import MemberService from "../models/Member.service";
import Errors from "../libs/Error";

const memberController: T = {};

const memberService = new MemberService();
memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body,
      result = await memberService.signup(input);
    //TODO:  tokens AUTHENTICATION

    res.json({ member: result });
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login ");
    const input: LoginInput = req.body,
      result = await memberService.login(input);
    //TODO:  tokens AUTHENTICATION

    res.json({ member: result });
  } catch (err) {
    console.log("Error, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default memberController;
