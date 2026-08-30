import { T } from "../libs/types/common";
import { Request, Response } from "express";
import { LoginInput, Member, MemberInput } from "../libs/types/member";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/Error";

const memberController: T = {};

const memberService = new MemberService();

const saveMemberSession = (req: Request, member: Member): Promise<void> =>
  new Promise((resolve, reject) => {
    const sessionInstance = req.session as T;
    sessionInstance.member = member;
    req.session.save((err) => err ? reject(err) : resolve());
  });

memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body,
      result = await memberService.signup(input);
    await saveMemberSession(req, result);

    res.status(HttpCode.CREATED).json({ member: result });
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body,
      result = await memberService.login(input);
    await saveMemberSession(req, result);

    res.status(HttpCode.OK).json({ member: result });
  } catch (err) {
    console.log("Error, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.getCurrentMember = async (req: Request, res: Response) => {
  try {
    const sessionInstance = req.session as T;
    const memberId = sessionInstance.member?._id;
    if (!memberId) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    const result = await memberService.getMemberDetail(String(memberId));
    sessionInstance.member = result;
    res.status(HttpCode.OK).json({ member: result });
  } catch (err) {
    console.log("Error, getCurrentMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error, logout:", err);
      return res.status(HttpCode.INTERNAL_SEVER_ERROR).json(Errors.standart);
    }

    res.clearCookie("connect.sid");
    res.status(HttpCode.OK).json({ logout: true });
  });
};

export default memberController;
