import MemberModel from "../controllers/schema/Member.model";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import { LoginInput, Member, MemberInput } from "../libs/types/member";

class MemberService {
  private readonly memberModel;
  constructor() {
    this.memberModel = MemberModel;
  }

  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.STORE })
      .exec();

    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
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

    const isMatch = input.memberPassword === member.memberPassword;
    if (!isMatch)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    return await this.memberModel.findById(member._id).exec();
  }
}
export default MemberService;
