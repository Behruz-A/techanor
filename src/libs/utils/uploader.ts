import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 } from "uuid";

function getTargetImageStorage(address: any) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = `./uploads/${address}`;
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}

const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({ storage: storage });
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

export default makeUploader;
