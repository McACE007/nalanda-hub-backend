import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3Config";

const storage = multerS3({
  s3,
  acl: "public-read",
  bucket: "nalanda-hub",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, `uploads/${filename}`);
  },
});

export const upload = multer({ storage });
