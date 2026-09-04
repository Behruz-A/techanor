import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import fs from "fs";
const memberService = new MemberService();

const storeController: T = {};
const saveAdminSession = (req: AdminRequest, member: any): Promise<void> =>
  new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);
      req.session.member = member;
      req.session.save((saveError) => saveError ? reject(saveError) : resolve());
    });
  });
storeController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);

    res.status(HttpCode.INTERNAL_SEVER_ERROR).send(Message.SOMETHING_WENT_WRONG);
  }
};

storeController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup", {
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    });
  } catch (err) {
    console.log("Error, getSignup:", err);
    res.status(HttpCode.INTERNAL_SEVER_ERROR).send(Message.SOMETHING_WENT_WRONG);
  }
};

storeController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login", {
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    });
  } catch (err) {
    console.log("Error, getLogin:", err);
    res.status(HttpCode.INTERNAL_SEVER_ERROR).send(Message.SOMETHING_WENT_WRONG);
  }
};

storeController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    if (req.body.memberPassword !== req.body.confirmPassword)
      throw new Errors(HttpCode.BAD_REQUEST, Message.PASSWORD_MISMATCH);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.STORE;
    const result = await memberService.processSignup(newMember);

    await saveAdminSession(req, result);
    res.redirect("/admin/product/all");
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.log("Error, processSignup!!!!!!!", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/signup') </script>`,
    );
  }
};

storeController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");

    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);

    await saveAdminSession(req, result);
    res.redirect("/admin/product/all");
  } catch (err) {
    console.log("Error, processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login') </script>`,
    );
  }
};

storeController.getMarketing = (req: Request, res: Response) => {
  res.render("marketing");
};

storeController.getAnalytics = (req: Request, res: Response) => {
  res.render("analytics");
};

storeController.processGoogleAuth = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const result = await memberService.processGoogleAuth(req.body.credential);

    await saveAdminSession(req, result);
    return res.status(HttpCode.OK).json({ redirectUrl: "/admin/product/all" });
  } catch (err) {
    console.log("Error, processGoogleAuth");
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standart.code).json(Errors.standart);
  }
};

storeController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");

    req.session.destroy(function (sessionError) {
      if (sessionError)
        return res.status(HttpCode.INTERNAL_SEVER_ERROR).send(Message.SOMETHING_WENT_WRONG);
      res.clearCookie("connect.sid");
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Error, logout:", err);

    res.redirect("/admin");
  }
};

storeController.checkAuthSession = async (req: AdminRequest, res: Response) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member)
      return res.status(HttpCode.OK).json({ authenticated: true, member: req.session.member });
    return res.status(HttpCode.UNAUTHORIZED).json({
      authenticated: false,
      message: Message.NOT_AUTHENTICATED,
    });
  } catch (err) {
    console.log("Error, checkAuthSession:", err);
    res.status(HttpCode.INTERNAL_SEVER_ERROR).json(Errors.standart);
  }
};

storeController.getUsers = async (req: Request, res: Response) => {
  try {
    const result = await memberService.getUsers();
    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.status(HttpCode.INTERNAL_SEVER_ERROR).send(Message.SOMETHING_WENT_WRONG);
  }
};

storeController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    const result = await memberService.updateChosenUser(req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

storeController.verifyStore = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.session?.member?.memberType === MemberType.STORE) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.status(HttpCode.UNAUTHORIZED).send(
      `<script> alert("${Message.NOT_AUTHENTICATED}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

export default storeController;
