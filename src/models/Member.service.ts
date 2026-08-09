import MemberModel from "../controllers/schema/Member.model";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Error";
import { Member, MemberInput } from "../libs/types/member";

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
}

export default MemberService;
