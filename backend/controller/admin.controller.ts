import { AuthRequest } from "../middleware/authMiddleware";
import OrderedPracticalFiles from "../schema/OrderedPracticalFiles.schema";
import { Response } from "express";
import PracticalFiles from "../schema/practicalfiles.schema";

type OrderedFileModel = {
  _id: string;
  userId: string;
  ref_FileId: string;
  name: string;
  branch: string;
  year: number;
  qty: number;
  subject_code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const getAllOrderedFilesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const files = await OrderedPracticalFiles.find();
    const finalOrders: OrderedFileModel[] = [];
    for (const file of files) {
      const practicalFile = await PracticalFiles.findById({
        _id: file.ref_FileId,
      });
      finalOrders.push({
        _id: file._id.toString(),
        userId: file.userId.toString(),
        ref_FileId: file.ref_FileId.toString(),
        name: practicalFile!.name,
        branch: practicalFile!.branch,
        year: practicalFile!.year,
        subject_code: practicalFile!.subject_code,
        qty: file.qty,
        status: file.status,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      });
    }
    res.status(200).json({ finalOrders });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

export { getAllOrderedFilesController };
