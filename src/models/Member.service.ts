import MemberModel from "../controllers/schema/Member.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AuthProvider, MemberType } from "../libs/enums/member.enum";
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
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);

      console.log("PASSED HERE");
      return result.toJSON();
    } catch (err) {
      console.log("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    //TODO: CONSIDER member status later
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 },
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword,
    );

    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    return await this.memberModel.findById(member._id).lean().exec();
  }

  /** BSSR  */

  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.STORE })
      .exec();

    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);

    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);

      console.log("PASSED HERE");
      return result;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 },
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword,
    );

    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    return await this.memberModel.findById(member._id).exec();
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
      throw new Errors(
        HttpCode.FORBIDDEN,
        Message.GOOGLE_ACCOUNT_NOT_ALLOWED,
      );

    const store = await this.memberModel
      .findOne({ memberType: MemberType.STORE })
      .exec();
    if (!store)
      throw new Errors(HttpCode.FORBIDDEN, Message.STORE_ACCOUNT_REQUIRED);

    const identityOwner = await this.memberModel
      .findOne({ $or: [{ googleId }, { memberEmail: email }] })
      .exec();
    if (identityOwner && !identityOwner._id.equals(store._id))
      throw new Errors(
        HttpCode.CONFLICT,
        Message.GOOGLE_ACCOUNT_CONFLICT,
      );
    if (store.googleId && store.googleId !== googleId)
      throw new Errors(
        HttpCode.FORBIDDEN,
        Message.GOOGLE_ACCOUNT_NOT_ALLOWED,
      );
    if (store.memberEmail && store.memberEmail.toLowerCase() !== email)
      throw new Errors(
        HttpCode.CONFLICT,
        Message.GOOGLE_ACCOUNT_CONFLICT,
      );

    store.googleId = googleId;
    store.memberEmail = email;
    store.authProvider = AuthProvider.GOOGLE;
    return await store.save();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);

    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}
export default MemberService;
