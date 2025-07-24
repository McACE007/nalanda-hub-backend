import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { s3 } from "../config/s3Config";

export const uploadFileToS3 = async ({
  bucket,
  key,
  localFilePath,
  contentType = "image/png",
}: {
  bucket: string;
  key: string;
  localFilePath: string;
  contentType?: string;
}) => {
  const fileStream = fs.createReadStream(localFilePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3.send(command);

  return `https://${bucket}.s3.amazonaws.com/${key}`;
};
