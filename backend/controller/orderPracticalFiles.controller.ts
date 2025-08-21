import OrderedPracticalFiles from "../schema/OrderedPracticalFiles.schema";

import { Request, Response } from "express";
import PracticalFiles from "../schema/practicalfiles.schema";

export interface AuthRequest extends Request {
  userId?: string;
}
type OrderedFileModel = {
  _id: string;
  ref_FileId: string;
  name: string;
  department: string;
  year: number;
  qty: number;
  subject_code: string;
  status: string;
  deletedByUser: boolean;
  createdAt: string;
  updatedAt: string;
};

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
        _id: file._id.toString(),
        ref_FileId: file.ref_FileId.toString(),
        name: practicalFile!.name,
        department: practicalFile!.department,
        year: practicalFile!.year,
        subject_code: practicalFile!.subject_code,
        qty: file.qty,
        status: file.status,
        deletedByUser: file.deletedByUser,
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

const deleteSelectedOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await OrderedPracticalFiles.findByIdAndUpdate(
      { _id: id },
      {
        deletedByUser: true,
      }
    );
    res.status(200).json({ deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

const clearAllOrderedFilesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { ids } = req.body;
    await OrderedPracticalFiles.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedByUser: true } }
    );
    res
      .status(200)
      .json({ success: true, message: "Orders cleared successfully" });
  } catch (error) {
    console.error("Error clearing orders:", error);
    res.status(500).json({ error: "Failed to clear orders" });
  }
};

export {
  orderPracticalFilesController,
  getOrderedPracticalFilesController,
  deleteSelectedOrderController,
  clearAllOrderedFilesController,
};
