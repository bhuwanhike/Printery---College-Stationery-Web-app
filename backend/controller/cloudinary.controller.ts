// upload.controller.ts
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { Request, Response } from "express";
import UploadFiles from "../schema/uploadableFiles.schema";
import { AuthRequest } from "../middleware/authMiddleware";

dotenv.config();

cloudinary.v2.config({
  secure: true,
});

interface MyJwtPayload extends jwt.JwtPayload {
  admissionNo: string;
  userId: string;
}

const generateFileHash = (buffer: Buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

const uploadToCloudinary = (
  file: Express.Multer.File,
  admissionNo: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let resourceType: "image" | "raw" = "image";
    if (file.mimetype === "application/pdf") resourceType = "raw";

    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: admissionNo,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

const uploadFilesToCloudinary = async (req: Request, res: Response) => {
  const { isColored, qty, status } = req.body;

  try {
    if (!req.files || !(req.files as Express.Multer.File[]).length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token found" });
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as MyJwtPayload;

    const isColoredArr = Array.isArray(req.body.isColored)
      ? req.body.isColored
      : [req.body.isColored];

    const qtyArr = Array.isArray(req.body.qty) ? req.body.qty : [req.body.qty];

    const statusArr = Array.isArray(req.body.status)
      ? req.body.status
      : [req.body.status];

    const files = req.files as Express.Multer.File[];
    const userId = decodedToken.userId;
    const admissionNo = decodedToken.admissionNo;

    const newFileUrls: string[] = [];
    const publicIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isColored = isColoredArr[i] === "true";
      const qty = parseInt(qtyArr[i], 10);
      const fileHash = generateFileHash(file.buffer);
      const status = statusArr[i];

      const existing = await UploadFiles.findOne({ userId, hash: fileHash });

      if (existing) {
        if (existing.status === "pending") {
          existing.qty += qty;
          await existing.save();
        } else {
          await UploadFiles.create({
            userId,
            hash: fileHash,
            url: existing.url,
            filename: existing.filename,
            isColored,
            qty,
            status,
            publicId: existing.publicId,
          });
        }

        console.log(`Duplicate avoided: ${file.originalname}`);
        newFileUrls.push(existing.url);
        publicIds.push(existing.publicId);
        continue;
      }
      const uploadResult = await uploadToCloudinary(file, admissionNo);
      const secureUrl = uploadResult.secure_url;
      const public_id = uploadResult.public_id;

      const uploadedFile = await UploadFiles.create({
        userId,
        hash: fileHash,
        url: secureUrl,
        filename: file.originalname,
        isColored,
        qty,
        status,
        publicId: public_id,
      });

      newFileUrls.push(secureUrl);
      publicIds.push(public_id);
    }

    const allFiles = await UploadFiles.find({ userId });

    res.json({
      success: true,
      fileData: allFiles,
      fileurl: newFileUrls,
      publicIds: publicIds,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

const deleteSelectedFile = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    const file = await UploadFiles.findByIdAndUpdate(_id, {
      deletedByUser: true,
    });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
};

const clearAllFiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    await UploadFiles.updateMany(
      { userId, status: "completed" },
      { $set: { deletedByUser: true } }
    );

    res.json({
      success: true,
      message: "All completed files marked as deleted",
    });
  } catch (error) {
    console.error("Error marking files deleted:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export { uploadFilesToCloudinary, deleteSelectedFile, clearAllFiles };
