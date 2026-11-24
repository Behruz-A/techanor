import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import { createInterface } from "readline";
import { Writable } from "stream";
import MemberModel from "../controllers/schema/Member.model";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";

class ResetError extends Error {}

async function resetAdminPassword() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--apply")) {
    throw new ResetError("Usage: node dist/scripts/reset-admin-password.js [--apply]");
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new ResetError("An interactive terminal is required; do not pipe passwords.");
  }

  dotenv.config();
  const mongoUrl = process.env.MONGO_URL_TECH?.trim();
  if (!mongoUrl) throw new ResetError("MONGO_URL_TECH is required in the existing environment.");
  if (mongoUrl.startsWith("mongodb+srv://")) {
    const servers = String(process.env.DNS_SERVERS || "")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    if (servers.length) dns.setServers(servers);
  }

  // Discard readline's output, including password echo and terminal redraws.
  // All answers are hidden, and no answers are kept in readline history.
  const silentOutput = new Writable({
    write(_chunk, _encoding, callback) { callback(); },
  });
  const terminal = createInterface({
    input: process.stdin,
    output: silentOutput,
    terminal: true,
    historySize: 0,
  });
  let pendingReject: ((error: Error) => void) | undefined;
  let closed = false;
  terminal.on("SIGINT", () => terminal.close());
  terminal.on("close", () => {
    closed = true;
    pendingReject?.(new ResetError("Cancelled."));
  });
  const ask = (prompt: string): Promise<string> => new Promise((resolve, reject) => {
    if (closed) return reject(new ResetError("Terminal closed."));
    pendingReject = reject;
    process.stdout.write(prompt);
    terminal.question("", (answer) => {
      pendingReject = undefined;
      process.stdout.write("\n");
      resolve(answer);
    });
  });

  try {
    console.log(args.length ? "WRITE MODE: requires approval and confirmation." : "READ-ONLY CHECK: no reset will be performed.");
    console.log("All terminal answers are hidden. Never enter a password as a command argument.");
    const expectedDatabase = (await ask("Expected MongoDB database name (not a URI): ")).trim();
    const memberNick = (await ask("Existing administrator username: ")).trim();
    if (!expectedDatabase || !memberNick) throw new ResetError("Database name and username are required.");

    mongoose.set("strictQuery", true);
    mongoose.set("debug", false);
    await mongoose.connect(mongoUrl, {
      autoIndex: false,
      autoCreate: false,
      serverSelectionTimeoutMS: 10000,
    });
    if (mongoose.connection.name !== expectedDatabase) {
      throw new ResetError("Database name mismatch. No password was changed.");
    }

    const filter = {
      memberNick,
      memberType: MemberType.STORE,
      memberStatus: MemberStatus.ACTIVE,
    };
    const members = await MemberModel.find(filter)
      .select("_id memberNick memberType memberStatus +memberPassword")
      .limit(2)
      .lean()
      .exec();
    if (members.length !== 1 || !members[0].memberPassword) {
      throw new ResetError("Expected exactly one active STORE account with an existing password. No password was changed.");
    }
    const member = members[0];
    console.log(`Confirmed database: ${mongoose.connection.name}`);
    console.log(`Existing administrator: ${member.memberNick} (${member._id.toString()})`);
    if (!args.length) {
      console.log("Read-only check complete. Rerun with --apply only after production reset approval.");
      return;
    }

    const confirmation = await ask(`After obtaining approval, type RESET ${member._id.toString()} to change only this password: `);
    if (confirmation !== `RESET ${member._id.toString()}`) throw new ResetError("Confirmation did not match. No password was changed.");
    let password = await ask("New password (hidden; 12+ characters, at most 72 UTF-8 bytes): ");
    let repeatedPassword = await ask("Confirm new password (hidden): ");
    if (password !== repeatedPassword) throw new ResetError("Passwords do not match. No password was changed.");
    if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72 || /[\x00-\x1f\x7f]/.test(password)) {
      throw new ResetError("Use at least 12 characters, at most 72 UTF-8 bytes, and no control characters.");
    }
    if (await bcrypt.compare(password, member.memberPassword!)) {
      throw new ResetError("Choose a different password. No password was changed.");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    password = "";
    repeatedPassword = "";

    // Compare-and-set prevents overwriting a concurrent password or status change.
    // Disable timestamps so memberPassword is the only field changed.
    const result = await MemberModel.updateOne(
      { ...filter, _id: member._id, memberPassword: member.memberPassword },
      { $set: { memberPassword: hashedPassword } },
      { upsert: false, runValidators: true, timestamps: false, writeConcern: { w: "majority" } },
    ).exec();
    if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
      throw new ResetError("Reset was not confirmed. The account may have changed concurrently; recheck before retrying.");
    }
    const verified = await MemberModel.findOne({ ...filter, _id: member._id })
      .select("+memberPassword")
      .lean()
      .exec();
    if (verified?.memberPassword !== hashedPassword) {
      throw new ResetError("The write completed but verification failed. Check login before retrying.");
    }
    console.log("Administrator password reset and database verification succeeded. Existing sessions were not changed.");
    console.log("Verify login, then remove this temporary script and its compiled output from every location.");
  } finally {
    terminal.close();
    silentOutput.end();
  }
}

resetAdminPassword()
  .catch((error: unknown) => {
    // Driver errors can contain connection details. Never log raw errors or stacks.
    console.error(error instanceof ResetError ? error.message : "Reset could not be confirmed. Connection details have been suppressed. If a write was attempted, check login before retrying.");
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      console.error("Database disconnect failed; details suppressed.");
      process.exitCode = 1;
    }
  });
