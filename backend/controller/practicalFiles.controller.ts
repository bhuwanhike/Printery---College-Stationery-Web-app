import { Request, Response } from "express";
import PracticalFiles from "../schema/practicalfiles.schema";

const getPracticalFiles = async (req: Request, res: Response) => {
  try {
    const practicalFiles = await PracticalFiles.find({});
    res.status(200).json(practicalFiles);
  } catch (error) {
    console.error("Error fetching practical files:", error);
    res.status(500).json({ error: "Failed to fetch practical files" });
  }
};

export default getPracticalFiles;
