import OrderedPracticalFiles from "../schema/OrderedPracticalFiles.schema";

import { Request, Response } from "express";
import PracticalFiles from "../schema/practicalfiles.schema";

export interface AuthRequest extends Request {
  userId?: string;
}

const orderPracticalFilesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const placeOrderFiles = req.body;
    if (!Array.isArray(placeOrderFiles)) {
      return res.status(400).json({ error: "Expected an array of orders" });
    }

    const savedOrders = await OrderedPracticalFiles.insertMany(placeOrderFiles);
    res.status(201).json({
      success: true,
      message: "Orders placed successfully",
      savedOrders,
    });
  } catch (error) {
    console.error("Error ordering practical files:", error);
    res.status(500).json({ error: "Failed to order practical files" });
  }
};

type OrderedFileModel = {
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

const getOrderedPracticalFilesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const orders = await OrderedPracticalFiles.find({ userId });
    const finalOrders: OrderedFileModel[] = [];
    for (const file of orders) {
      const practicalFile = await PracticalFiles.findById({
        _id: file.ref_FileId,
      });
      finalOrders.push({
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
    console.error("Error fetching ordered practical files:", error);
    res.status(500).json({ error: "Failed to fetch ordered practical files" });
  }
};

const changeFileStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { ref_FileId } = req.body;
    const updatedOrder = await OrderedPracticalFiles.findOneAndUpdate(
      { ref_FileId: ref_FileId, userId },
      { status: "completed" },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json({ updatedOrder });
  } catch (error) {
    console.error("Error changing file status:", error);
    res.status(500).json({ error: "Failed to change file status" });
  }
};

export {
  orderPracticalFilesController,
  getOrderedPracticalFilesController,
  changeFileStatus,
};
