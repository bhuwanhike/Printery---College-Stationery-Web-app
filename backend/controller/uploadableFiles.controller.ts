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

const changeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = await UploadFiles.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    file.status = "completed";
    await file.save();
    res.status(200).json(file);
  } catch (error) {
    console.error("Error changing file status:", error);
    res.status(500).json({ error: "Failed to change file status" });
  }
};

export { uploadFilesToDB, getFilesFromDB, changeStatus };
