import Errors, { HttpCode, Message } from "../libs/Error";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../controllers/schema/View.model";

class ViewService {
  private readonly viewModel;

  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View | null> {
    return await this.viewModel
      .findOne({ memberId: input.memberId, viewRefId: input.viewRefId })
      .exec();
  }

  public async insertMemberView(input: ViewInput): Promise<View> {
    try {
      return await this.viewModel.create(input);
    } catch (err) {
      console.log("ERROR, model:insertMemberView:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async registerUniqueView(input: ViewInput): Promise<boolean> {
    try {
      const result = await this.viewModel.updateOne(
        {
          memberId: input.memberId,
          viewRefId: input.viewRefId,
          viewGroup: input.viewGroup,
        },
        { $setOnInsert: input },
        { upsert: true },
      ).exec();

      return result.upsertedCount === 1;
    } catch (err: any) {
      if (err?.code === 11000) return false;
      console.log("ERROR, model:registerUniqueView:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }
}

export default ViewService;
