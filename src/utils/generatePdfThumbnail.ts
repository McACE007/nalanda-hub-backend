import path from "path";
import fs from "fs/promises";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Config";
import { fromBuffer } from "pdf2pic";
import { uploadFileToS3 } from "./uploadFileToS3";

const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export const generatePdfThumbnailFromS3 = async (
  bucket: string,
  key: string,
  outputDir = "./thumbnails"
): Promise<string> => {
  const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(getObjectCommand);

  const pdfBuffer = await streamToBuffer(
    response.Body as NodeJS.ReadableStream
  );

  const fileName = path.basename(key, path.extname(key));

  const converter = fromBuffer(pdfBuffer, {
    density: 100,
    saveFilename: fileName,
    savePath: outputDir,
    format: "png",
    width: 200,
    height: 250,
  });

  const result = await converter(1);

  if (!result || !result.path) throw new Error("Thumbnail generation failed");

  const thumbnailUrl = await uploadFileToS3({
    bucket,
    key: `thumbnails/${result.name}`,
    localFilePath: result.path,
  });

  fs.rm(result.path);

  return thumbnailUrl;
};
