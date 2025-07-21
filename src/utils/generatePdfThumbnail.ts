import path from "path";
import { fromPath } from "pdf2pic";

export const generatePdfThumbnail = async (
  pdfName: string,
  pdfPath: string
): Promise<string> => {
  const outputDir = path.dirname(pdfPath);

  const options = {
    density: 300,
    saveFilename: pdfName.split(".")[0],
    savePath: outputDir,
    format: "png",
    width: 200,
    height: 250,
  };

  const pdf2pic = fromPath(pdfPath, options);
  const thumbnail = await pdf2pic(1);

  if (!thumbnail) throw new Error("Thumbnail not generated");

  return thumbnail.path!;
};
