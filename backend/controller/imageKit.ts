import dotenv from "dotenv";
dotenv.config();
import ImageKit from "imagekit";
import { Request, Response } from "express";
import mongoose from "mongoose";
const imagekit = new ImageKit({
  publicKey: "public_WlL/nAHBtmfQoGuLagyfd/+klTc=",
  privateKey: "private_I0CRFP+2AeQ3jILnzYwy7cuZaNk=",
  urlEndpoint: "https://ik.imagekit.io/k15ju3cvr",
});

const FileSchema = new mongoose.Schema({
  fileName: String,
  fileType: String,
  size: Number,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});
const FileModel = mongoose.model("File", FileSchema);

const uploadFileToImageKit = async (req: Request, res: Response) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  console.log(
    "Received files:",
    (req.files as Express.Multer.File[]).map((f) => f.originalname)
  );

  try {
    const uploadResults = await Promise.all(
      (req.files as Express.Multer.File[]).map(async (file) => {
        console.log("Uploading:", file.originalname);
        const result = await imagekit.upload({
          file: file.buffer, // ✅ use Buffer directly
          fileName: file.originalname,
        });
        console.log("Uploaded:", result.url);
        return result;
      })
    );

    console.log("All uploads complete");
    return res.json({ success: true, files: uploadResults });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: error });
  }
};

export default uploadFileToImageKit;
