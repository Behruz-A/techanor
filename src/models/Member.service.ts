import MemberModel from "../controllers/schema/Member.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import {
  AuthProvider,
  MemberStatus,
  MemberType,
} from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import * as bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

class MemberService {
  private readonly memberModel;
  constructor() {
    this.memberModel = MemberModel;
  }

  /**SPA */

  public async signup(input: MemberInput): Promise<Member> {
    const memberNick = String(input.memberNick || "").trim();
    const memberPhone = String(input.memberPhone || "").replace(/[\s()-]/g, "");
    const memberPassword = String(input.memberPassword || "");

    if (!/^[A-Za-z0-9_]{2,30}$/.test(memberNick))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_NICK);
    if (!/^\+?\d{7,15}$/.test(memberPhone))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_PHONE);
    if (memberPassword.length < 6 || memberPassword.length > 72)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_PASSWORD);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(memberPassword, salt);
    const safeInput: MemberInput = {
      memberType: MemberType.USER,
      memberStatus: MemberStatus.ACTIVE,
      memberNick,
      memberPhone,
      memberPassword: hashedPassword,
    };

    let createdMember;
    try {
      createdMember = await this.memberModel.create(safeInput);
    } catch (err) {
      console.log("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }

    const safeMember = await this.memberModel.findById(createdMember._id).lean().exec();
    if (!safeMember)
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    return safeMember;
  }

  public async login(input: LoginInput): Promise<Member> {
    const memberNick = String(input?.memberNick || "").trim();
    const memberPassword = String(input?.memberPassword || "");
    if (!memberNick || !memberPassword)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_LOGIN_INPUT);
    const member = await this.memberModel
      .findOne({
        memberNick,
        memberStatus: { $ne: MemberStatus.DELETE },
      })
      .select("+memberPassword")
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    if (!member.memberPassword)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    const isMatch = await bcrypt.compare(memberPassword, member.memberPassword);

    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    const safeMember = await this.memberModel.findById(member._id).lean().exec();
    if (!safeMember)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    return safeMember;
  }

  public async getMemberDetail(memberId: string): Promise<Member> {
    const member = await this.memberModel
      .findOne({ _id: shapeIntoMongooseObjectId(memberId), memberStatus: MemberStatus.ACTIVE })
      .lean()
      .exec();
    if (!member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    return member;
  }

  public async updateMember(memberId: string, input: MemberUpdateInput): Promise<Member> {
    const memberNick = String(input.memberNick || "").trim();
    const memberPhone = String(input.memberPhone || "").replace(/[\s()-]/g, "");
    const memberAddress = String(input.memberAddress || "").trim().slice(0, 180);
    const memberDesc = String(input.memberDesc || "").trim().slice(0, 500);
    if (!/^[A-Za-z0-9_]{2,30}$/.test(memberNick)) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_NICK);
    if (!/^\+?\d{7,15}$/.test(memberPhone)) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_PHONE);
    const update: Partial<MemberUpdateInput> = { memberNick, memberPhone, memberAddress, memberDesc };
    if (input.memberImage) update.memberImage = input.memberImage;
    try {
      const result = await this.memberModel.findOneAndUpdate(
        { _id: shapeIntoMongooseObjectId(memberId), memberStatus: MemberStatus.ACTIVE },
        { $set: update },
        { new: true, runValidators: true },
      ).lean().exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
    } catch (err) {
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  /** BSSR  */

  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.STORE })
      .exec();

    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);

    const memberNick = String(input.memberNick || "").trim();
    const memberPhone = String(input.memberPhone || "").replace(/[\s()-]/g, "");
    const memberPassword = String(input.memberPassword || "");
    if (!/^[A-Za-z0-9_]{2,30}$/.test(memberNick))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_NICK);
    if (!/^\+?\d{7,15}$/.test(memberPhone))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_PHONE);
    if (memberPassword.length < 8 || memberPassword.length > 72)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_PASSWORD);

    const salt = await bcrypt.genSalt();
    const safeInput: MemberInput = {
      ...input,
      memberNick,
      memberPhone,
      memberPassword: await bcrypt.hash(memberPassword, salt),
      memberType: MemberType.STORE,
      memberStatus: MemberStatus.ACTIVE,
    };

    try {
      const result = await this.memberModel.create(safeInput);
      const safeMember = await this.memberModel.findById(result._id).lean().exec();
      if (!safeMember)
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
      return safeMember;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const memberNick = String(input.memberNick || "").trim();
    const memberPassword = String(input.memberPassword || "");
    if (!memberNick || !memberPassword)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_LOGIN_INPUT);
    const member = await this.memberModel
      .findOne({ memberNick, memberType: MemberType.STORE })
      .select("+memberPassword memberNick memberStatus memberType")
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    if (member.memberStatus !== MemberStatus.ACTIVE)
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);

    if (!member.memberPassword)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    const isMatch = await bcrypt.compare(memberPassword, member.memberPassword);

    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    const safeMember = await this.memberModel.findById(member._id).exec();
    if (!safeMember)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    return safeMember;
  }

  public async processGoogleAuth(credential: string): Promise<Member> {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const approvedEmail = process.env.ADMIN_GOOGLE_EMAIL?.trim().toLowerCase();

    if (!clientId || !approvedEmail)
      throw new Errors(
        HttpCode.INTERNAL_SEVER_ERROR,
        Message.GOOGLE_AUTH_NOT_CONFIGURED,
      );
    if (!credential)
      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.GOOGLE_CREDENTIAL_REQUIRED,
      );

    let payload;
    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (_) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.INVALID_GOOGLE_CREDENTIAL,
      );
    }

    const googleId = payload?.sub;
    const email = payload?.email?.trim().toLowerCase();
    if (!googleId || !email)
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.INVALID_GOOGLE_CREDENTIAL,
      );
    if (!payload?.email_verified)
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.GOOGLE_EMAIL_NOT_VERIFIED,
      );
    if (email !== approvedEmail)
      throw new Errors(HttpCode.FORBIDDEN, Message.GOOGLE_ACCOUNT_NOT_ALLOWED);

    const store = await this.memberModel
      .findOne({ memberType: MemberType.STORE })
      .exec();
    if (!store)
      throw new Errors(HttpCode.FORBIDDEN, Message.STORE_ACCOUNT_REQUIRED);

    const identityOwner = await this.memberModel
      .findOne({ $or: [{ googleId }, { memberEmail: email }] })
      .exec();
    if (identityOwner && !identityOwner._id.equals(store._id))
      throw new Errors(HttpCode.CONFLICT, Message.GOOGLE_ACCOUNT_CONFLICT);
    if (store.googleId && store.googleId !== googleId)
      throw new Errors(HttpCode.FORBIDDEN, Message.GOOGLE_ACCOUNT_NOT_ALLOWED);
    if (store.memberEmail && store.memberEmail.toLowerCase() !== email)
      throw new Errors(HttpCode.CONFLICT, Message.GOOGLE_ACCOUNT_CONFLICT);

    store.googleId = googleId;
    store.memberEmail = email;
    store.authProvider = AuthProvider.GOOGLE;
    return await store.save();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .sort({ createdAt: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(input._id);
    if (
      !input.memberStatus ||
      !Object.values(MemberStatus).includes(input.memberStatus)
    ) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }

    const result = await this.memberModel
      .findOneAndUpdate(
        { _id: memberId, memberType: MemberType.USER },
        { memberStatus: input.memberStatus },
        { new: true, runValidators: true },
      )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);
    return result;
  }
}
export default MemberService;
