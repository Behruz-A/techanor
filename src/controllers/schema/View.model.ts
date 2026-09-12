import mongoose, { Schema } from "mongoose";
import { ViewGroup } from "../../libs/enums/view.enum";
import { View } from "../../libs/types/view";

const viewSchema = new Schema<View>(
  {
    viewGroup: {
      type: String,
      enum: ViewGroup,
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
    viewRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);
viewSchema.index({ memberId: 1, viewRefId: 1, viewGroup: 1 }, { unique: true });
export default mongoose.model<View>("View", viewSchema);
