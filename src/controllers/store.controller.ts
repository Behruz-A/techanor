import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import fs from "fs";
const memberService = new MemberService();

const storeController: T = {};
storeController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);

    res.redirect("/admin");
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
    res.redirect("/admin");
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
    res.redirect("/admin");
  }
};

storeController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.STORE;
    const result = await memberService.processSignup(newMember);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
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

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/product/all");
    });
  } catch (err) {
    console.log("Error, processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login') </script>`,
    );
  }
};

storeController.processGoogleAuth = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const result = await memberService.processGoogleAuth(req.body.credential);

    req.session.member = result;
    req.session.save(function (sessionError) {
      if (sessionError)
        return res
          .status(HttpCode.INTERNAL_SEVER_ERROR)
          .json(Errors.standart);

      return res.status(HttpCode.OK).json({
        redirectUrl: "/admin/product/all",
      });
    });
  } catch (err) {
    console.log("Error, processGoogleAuth");
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standart.code).json(Errors.standart);
  }
};

storeController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");

    req.session.destroy(function () {
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
      res.send(`<script> alert("${req.session.member.memberNick}") </script>`);
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}") </script>`);
  } catch (err) {
    console.log("Error, checkAuthSession:", err);
    res.send(err);
  }
};

storeController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");

    const result = await memberService.getUsers();
    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.redirect("/admin/login");
  }
};

storeController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
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
    res.send(
      `<script> alert("${Message.NOT_AUTHENTICATED}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

export default storeController;
