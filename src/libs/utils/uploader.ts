import path from "path";
import fs from "fs";
import multer from "multer";
import { randomUUID } from "crypto";
import { Message } from "../Error";

function getTargetImageStorage(address: any) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = `./uploads/${address}`;
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = randomUUID() + extension.toLowerCase();
      cb(null, random_name);
    },
  });
}

const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({ storage: storage });
};

export const makeProductUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({
    storage,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        cb(new Error(Message.INVALID_PRODUCT_IMAGE));
        return;
      }
      cb(null, true);
    },
  });
};

export const makeBlogUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({
    storage,
    limits: { files: 2, fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const imageTypes = ["image/jpeg", "image/png", "image/webp"];
      const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
      const allowed = file.fieldname === "blogPostImage"
        ? imageTypes.includes(file.mimetype)
        : file.fieldname === "blogPostVideo" && videoTypes.includes(file.mimetype);

      if (!allowed) {
        cb(new Error("Unsupported blog media type"));
        return;
      }
      cb(null, true);
    },
  });
};

export const makeAvatarUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({
    storage,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        cb(new Error("Unsupported profile image type"));
        return;
      }
      cb(null, true);
    },
  });
};

export default makeUploader;
