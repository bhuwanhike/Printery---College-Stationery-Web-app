import { Request, Response } from "express";
import UploadFiles from "../schema/uploadableFiles.schema";

const uploadFilesToDB = async (req: Request, res: Response) => {
  try {
    const filesInfo = req.body;
    const fileData = filesInfo.forEach(async (file: any) => {
      await UploadFiles.create({
        userId: file.userID,
        url: file.imgUrl,
        filename: file.name,
        isColored: file.isColored,
        qty: file.qty,
      });
    });

    return res.status(200).json({ fileData });
  } catch (error) {
    console.error("File Info not stored:", error);
    res.status(500).json({ error: "File Info not stored" });
  }
};

const getFilesFromDB = async (req: Request, res: Response) => {
  try {
    // Get all files, newest first
    // console.log("Fetching files from DB");
    const files = await UploadFiles.find();
    // console.log(files);
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

export { uploadFilesToDB, getFilesFromDB };
