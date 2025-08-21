"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllFiles = exports.deleteSelectedFile = exports.uploadFilesToCloudinary = void 0;
// upload.controller.ts
const cloudinary_1 = __importDefault(require("cloudinary"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const uploadableFiles_schema_1 = __importDefault(require("../schema/uploadableFiles.schema"));
dotenv_1.default.config();
cloudinary_1.default.v2.config({
    secure: true,
});
const generateFileHash = (buffer) => crypto_1.default.createHash("sha256").update(buffer).digest("hex");
const uploadToCloudinary = (file, admissionNo) => {
    return new Promise((resolve, reject) => {
        let resourceType = "image";
        if (file.mimetype === "application/pdf")
            resourceType = "raw";
        const stream = cloudinary_1.default.v2.uploader.upload_stream({
            folder: admissionNo,
            resource_type: resourceType,
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        stream.end(file.buffer);
    });
};
const uploadFilesToCloudinary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isColored, qty, status } = req.body;
    try {
        if (!req.files || !req.files.length) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ error: "No token found" });
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const isColoredArr = Array.isArray(req.body.isColored)
            ? req.body.isColored
            : [req.body.isColored];
        const qtyArr = Array.isArray(req.body.qty) ? req.body.qty : [req.body.qty];
        const statusArr = Array.isArray(req.body.status)
            ? req.body.status
            : [req.body.status];
        const files = req.files;
        const userId = decodedToken.userId;
        const admissionNo = decodedToken.admissionNo;
        const newFileUrls = [];
        const publicIds = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isColored = isColoredArr[i] === "true";
            const qty = parseInt(qtyArr[i], 10);
            const fileHash = generateFileHash(file.buffer);
            const status = statusArr[i];
            const existing = yield uploadableFiles_schema_1.default.findOne({ userId, hash: fileHash });
            if (existing) {
                if (existing.status === "pending") {
                    existing.qty += qty;
                    yield existing.save();
                }
                else {
                    yield uploadableFiles_schema_1.default.create({
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
            const uploadResult = yield uploadToCloudinary(file, admissionNo);
            const secureUrl = uploadResult.secure_url;
            const public_id = uploadResult.public_id;
            const uploadedFile = yield uploadableFiles_schema_1.default.create({
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
        const allFiles = yield uploadableFiles_schema_1.default.find({ userId });
        res.json({
            success: true,
            fileData: allFiles,
            fileurl: newFileUrls,
            publicIds: publicIds,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});
exports.uploadFilesToCloudinary = uploadFilesToCloudinary;
const deleteSelectedFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.body;
    try {
        const file = yield uploadableFiles_schema_1.default.findByIdAndUpdate(_id, {
            deletedByUser: true,
        });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Delete failed" });
    }
});
exports.deleteSelectedFile = deleteSelectedFile;
const clearAllFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        yield uploadableFiles_schema_1.default.updateMany({ userId, status: "completed" }, { $set: { deletedByUser: true } });
        res.json({
            success: true,
            message: "All completed files marked as deleted",
        });
    }
    catch (error) {
        console.error("Error marking files deleted:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
exports.clearAllFiles = clearAllFiles;
