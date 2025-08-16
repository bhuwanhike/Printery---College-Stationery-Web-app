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
exports.changeStatus = exports.getFilesFromDB = exports.uploadFilesToDB = void 0;
const uploadableFiles_schema_1 = __importDefault(require("../schema/uploadableFiles.schema"));
const uploadFilesToDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filesInfo = req.body;
        const fileData = filesInfo.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            yield uploadableFiles_schema_1.default.create({
                userId: file.userID,
                url: file.imgUrl,
                filename: file.name,
                isColored: file.isColored,
                qty: file.qty,
            });
        }));
        return res.status(200).json({ fileData });
    }
    catch (error) {
        console.error("File Info not stored:", error);
        res.status(500).json({ error: "File Info not stored" });
    }
});
exports.uploadFilesToDB = uploadFilesToDB;
const getFilesFromDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all files, newest first
        // console.log("Fetching files from DB");
        const files = yield uploadableFiles_schema_1.default.find();
        // console.log(files);
        res.status(200).json(files);
    }
    catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});
exports.getFilesFromDB = getFilesFromDB;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const file = yield uploadableFiles_schema_1.default.findById(id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        file.status = "completed";
        yield file.save();
        res.status(200).json(file);
    }
    catch (error) {
        console.error("Error changing file status:", error);
        res.status(500).json({ error: "Failed to change file status" });
    }
});
exports.changeStatus = changeStatus;
