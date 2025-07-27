import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Config";

export const deleteFileFromS3 = async ({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
};
