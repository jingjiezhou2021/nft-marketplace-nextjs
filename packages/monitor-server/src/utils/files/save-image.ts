import { FileUpload } from "graphql-upload-ts";
import path from "path";
import fs from "fs";
export default async function SaveImage(file: FileUpload) {
  const { createReadStream, filename } = await file;

  // Save avatar image
  const newFilename = `avatar-${filename}`;
  const avatarPath = path.join(process.cwd(), "upload", newFilename);

  await new Promise<void>((resolve, reject) =>
    createReadStream()
      .pipe(fs.createWriteStream(avatarPath))
      .on("finish", resolve)
      .on("error", reject)
  );
  return newFilename;
}
