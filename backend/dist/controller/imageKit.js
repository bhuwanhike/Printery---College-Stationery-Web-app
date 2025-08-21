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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const imagekit_1 = __importDefault(require("imagekit"));
const mongoose_1 = __importDefault(require("mongoose"));
const imagekit = new imagekit_1.default({
    publicKey: "public_WlL/nAHBtmfQoGuLagyfd/+klTc=",
    privateKey: "private_I0CRFP+2AeQ3jILnzYwy7cuZaNk=",
    urlEndpoint: "https://ik.imagekit.io/k15ju3cvr",
});
const FileSchema = new mongoose_1.default.Schema({
    fileName: String,
    fileType: String,
    size: Number,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
});
const FileModel = mongoose_1.default.model("File", FileSchema);
const uploadFileToImageKit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !req.files.length) {
        return res.status(400).json({ error: "No files uploaded" });
    }
    console.log("Received files:", req.files.map((f) => f.originalname));
    try {
        const uploadResults = yield Promise.all(req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Uploading:", file.originalname);
            const result = yield imagekit.upload({
                file: file.buffer, // ✅ use Buffer directly
                fileName: file.originalname,
            });
            console.log("Uploaded:", result.url);
            return result;
        })));
        console.log("All uploads complete");
        return res.json({ success: true, files: uploadResults });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Upload failed", details: error });
    }
});
exports.default = uploadFileToImageKit;
