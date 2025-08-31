import dotenv from "dotenv";
dotenv.config();
import { AuthRequest } from "../middleware/authMiddleware";
import OrderedPracticalFiles from "../schema/OrderedPracticalFiles.schema";
import { Request, Response } from "express";
import PracticalFiles from "../schema/practicalfiles.schema";
import UploadFiles from "../schema/uploadableFiles.schema";
import Help from "../schema/help.schema";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import SignUp from "../schema/sign-up.schema";

cloudinary.v2.config({
  secure: true,
});

type OrderedFileModel = {
  _id: string;
  userId: string;
  ref_FileId: string;
  name: string;
  department: string;
  year: number;
  qty: number;
  deletedByUser: boolean;
  subject_code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type HelpModel = {
  _id: string;
  ref_userId: string;
  admissionNo: string;
  email: string; // ⬅ add
  message: string; // ⬅ add
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Printout = {
  _id: string;
  userId: string;
  url: string;
  filename: string;
  deletedByUser: boolean;
  isColored: boolean;
  qty: number;
  publicId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// Practical Files
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
        department: practicalFile!.department,
        year: practicalFile!.year,
        subject_code: practicalFile!.subject_code,
        qty: file.qty,
        deletedByUser: file.deletedByUser,
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
const changeFileStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { ref_FileId, userId, _id } = req.body;
    const updatedOrder = await OrderedPracticalFiles.findOneAndUpdate(
      { ref_FileId: ref_FileId, userId, _id },
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

// Printouts
const changePrintoutStatus = async (req: AuthRequest, res: Response) => {
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
const deleteSelectedFile = async (req: Request, res: Response) => {
  try {
    const { id, url, publicId } = req.body;

    // Find all files that share this URL
    const assetRequired: Printout[] = await UploadFiles.find({ url });

    // Only delete from Cloudinary if this is the last DB reference
    if (
      assetRequired.length === 1 &&
      assetRequired[0]._id.toString() === id &&
      assetRequired[0].publicId === publicId
    ) {
      const resource_type = assetRequired[0].filename.endsWith(".pdf")
        ? "raw"
        : "image";

      await cloudinary.v2.uploader.destroy(publicId, {
        resource_type,
        invalidate: true,
      });
    }

    // Delete the DB record
    const file = await UploadFiles.findByIdAndDelete(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json(file);
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

const clearAllPrintouts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query; // optional param

    // Filter for files to delete
    const filter: any = { status: "completed", deletedByUser: true };
    if (userId) filter.userId = userId;

    // ✅ only apply if userId is a valid ObjectId
    if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    }

    // Get files to delete (with URLs and publicIds)
    const filesToDelete = await UploadFiles.find(filter);

    // Extract their urls for checking
    const urlsToDelete = filesToDelete.map((f) => f.url);

    // Find files in DB that are NOT part of deletion (still active/needed)
    const stillExisting = await UploadFiles.find({
      url: { $in: urlsToDelete },
      _id: { $nin: filesToDelete.map((f) => f._id) },
    });

    // Extract safe-to-delete URLs (those not in stillExisting)
    const stillExistingUrls = new Set(stillExisting.map((f) => f.url));
    const safeFiles = filesToDelete.filter(
      (f) => !stillExistingUrls.has(f.url)
    );

    // Delete from Cloudinary only the safe files
    for (const file of safeFiles) {
      if (file.url && file.publicId) {
        const resourceType = file.filename.endsWith(".pdf") ? "raw" : "image";
        await cloudinary.v2.uploader.destroy(file.publicId, {
          resource_type: resourceType,
          invalidate: true,
        });
      }
    }

    // Finally, delete from DB
    await UploadFiles.deleteMany(filter);

    res.status(200).json({
      message: userId
        ? `Deleted completed+marked files for user ${userId}`
        : "Deleted completed+marked files globally",
      dbDeletedCount: filesToDelete.length,
      cloudinaryDeletedCount: safeFiles.length,
    });
  } catch (error) {
    console.error("Error deleting printouts:", error);
    res.status(500).json({ error: "Failed to delete printouts" });
  }
};

// Ordered Files

const deleteSelectedOrderedFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const file = await OrderedPracticalFiles.findByIdAndDelete(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(file);
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

const clearAllOrderedFiles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const filter: any = { status: "completed", deletedByUser: true };
    if (userId) filter.userId = userId;
    const files = await OrderedPracticalFiles.deleteMany(filter);
    res.status(200).json(files);
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ error: "Failed to delete files" });
  }
};

// Query
const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await Help.find();
    res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};
const changeTicketStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { _id } = req.body;
    const ticket = await Help.findById(_id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    ticket.status = "closed";
    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error changing ticket status:", error);
    res.status(500).json({ error: "Failed to change ticket status" });
  }
};
const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;
    const ticket = await Help.findByIdAndDelete(_id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};
const clearAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Help.deleteMany({
      status: "closed",
      deletedByUser: true,
    });
    res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error deleting tickets:", error);
    res.status(500).json({ error: "Failed to delete tickets" });
  }
};

// Change admin details
const adminSettingsController = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionNo, password, userID } = req.body;
    const user = await SignUp.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "No admin found" });
    }
    user.admissionNo = admissionNo;
    user.password = password;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error changing admin details:", error);
    res.status(500).json({ error: "Failed to change admin details" });
  }
};

export {
  getAllOrderedFilesController,
  changeFileStatus,
  changePrintoutStatus,
  orderPracticalFilesController,
  getTickets,
  changeTicketStatus,
  deleteTicket,
  clearAllTickets,
  deleteSelectedFile,
  clearAllPrintouts,
  deleteSelectedOrderedFile,
  clearAllOrderedFiles,
  adminSettingsController,
};
