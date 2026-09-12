import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import MemberModel from "../controllers/schema/Member.model";
import OrderModel from "../controllers/schema/Order.model";
import { MemberType } from "../libs/enums/member.enum";
import { OrderStatus } from "../libs/enums/order.enum";

dotenv.config();

async function syncMemberPoints() {
  const mongoUrl = process.env.MONGO_URL_TECH?.trim();
  if (!mongoUrl) throw new Error("MONGO_URL_TECH is required");
  if (mongoUrl.startsWith("mongodb+srv://")) {
    const servers = String(process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    if (servers.length) dns.setServers(servers);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUrl);
  const counts = await OrderModel.aggregate<{ _id: mongoose.Types.ObjectId; points: number }>([
    { $match: { orderStatus: { $ne: OrderStatus.DELETE } } },
    { $group: { _id: "$memberId", points: { $sum: 1 } } },
  ]).exec();

  await MemberModel.updateMany(
    { memberType: MemberType.USER },
    { $set: { memberPoints: 0 } },
  ).exec();
  if (counts.length) {
    await MemberModel.bulkWrite(counts.map(({ _id, points }) => ({
      updateOne: {
        filter: { _id, memberType: MemberType.USER },
        update: { $set: { memberPoints: points } },
      },
    })));
  }

  console.log(`Synced ${counts.length} members with ${counts.reduce((sum, item) => sum + item.points, 0)} total points.`);
}

syncMemberPoints()
  .catch((error) => {
    console.error("Member point sync failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
