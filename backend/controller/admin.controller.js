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
exports.adminSettingsController = exports.clearAllOrderedFiles = exports.deleteSelectedOrderedFile = exports.clearAllPrintouts = exports.deleteSelectedFile = exports.clearAllTickets = exports.deleteTicket = exports.changeTicketStatus = exports.getTickets = exports.orderPracticalFilesController = exports.changePrintoutStatus = exports.changeFileStatus = exports.getAllOrderedFilesController = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OrderedPracticalFiles_schema_1 = __importDefault(require("../schema/OrderedPracticalFiles.schema"));
const practicalfiles_schema_1 = __importDefault(require("../schema/practicalfiles.schema"));
const uploadableFiles_schema_1 = __importDefault(require("../schema/uploadableFiles.schema"));
const help_schema_1 = __importDefault(require("../schema/help.schema"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
const sign_up_schema_1 = __importDefault(require("../schema/sign-up.schema"));
cloudinary_1.default.v2.config({
    secure: true,
});
// Practical Files
const orderPracticalFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeOrderFiles = req.body;
        if (!Array.isArray(placeOrderFiles)) {
            return res.status(400).json({ error: "Expected an array of orders" });
        }
        const savedOrders = yield OrderedPracticalFiles_schema_1.default.insertMany(placeOrderFiles);
        res.status(201).json({
            success: true,
            message: "Orders placed successfully",
            savedOrders,
        });
    }
    catch (error) {
        console.error("Error ordering practical files:", error);
        res.status(500).json({ error: "Failed to order practical files" });
    }
});
exports.orderPracticalFilesController = orderPracticalFilesController;
const getAllOrderedFilesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield OrderedPracticalFiles_schema_1.default.find();
        const finalOrders = [];
        for (const file of files) {
            const practicalFile = yield practicalfiles_schema_1.default.findById({
                _id: file.ref_FileId,
            });
            finalOrders.push({
                _id: file._id.toString(),
                userId: file.userId.toString(),
                ref_FileId: file.ref_FileId.toString(),
                name: practicalFile.name,
                department: practicalFile.department,
                year: practicalFile.year,
                subject_code: practicalFile.subject_code,
                qty: file.qty,
                deletedByUser: file.deletedByUser,
                status: file.status,
                createdAt: file.createdAt.toISOString(),
                updatedAt: file.updatedAt.toISOString(),
            });
        }
        res.status(200).json({ finalOrders });
    }
    catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});
exports.getAllOrderedFilesController = getAllOrderedFilesController;
const changeFileStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref_FileId, userId, _id } = req.body;
        const updatedOrder = yield OrderedPracticalFiles_schema_1.default.findOneAndUpdate({ ref_FileId: ref_FileId, userId, _id }, { status: "completed" }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ updatedOrder });
    }
    catch (error) {
        console.error("Error changing file status:", error);
        res.status(500).json({ error: "Failed to change file status" });
    }
});
exports.changeFileStatus = changeFileStatus;
// Printouts
const changePrintoutStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.changePrintoutStatus = changePrintoutStatus;
const deleteSelectedFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, url, publicId } = req.body;
        // Find all files that share this URL
        const assetRequired = yield uploadableFiles_schema_1.default.find({ url });
        // Only delete from Cloudinary if this is the last DB reference
        if (assetRequired.length === 1 &&
            assetRequired[0]._id.toString() === id &&
            assetRequired[0].publicId === publicId) {
            const resource_type = assetRequired[0].filename.endsWith(".pdf")
                ? "raw"
                : "image";
            yield cloudinary_1.default.v2.uploader.destroy(publicId, {
                resource_type,
                invalidate: true,
            });
        }
        // Delete the DB record
        const file = yield uploadableFiles_schema_1.default.findByIdAndDelete(id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).json(file);
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
});
exports.deleteSelectedFile = deleteSelectedFile;
const clearAllPrintouts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query; // optional param
        // Filter for files to delete
        const filter = { status: "completed", deletedByUser: true };
        if (userId)
            filter.userId = userId;
        // ✅ only apply if userId is a valid ObjectId
        if (userId && mongoose_1.default.Types.ObjectId.isValid(userId)) {
            filter.userId = userId;
        }
        // Get files to delete (with URLs and publicIds)
        const filesToDelete = yield uploadableFiles_schema_1.default.find(filter);
        // Extract their urls for checking
        const urlsToDelete = filesToDelete.map((f) => f.url);
        // Find files in DB that are NOT part of deletion (still active/needed)
        const stillExisting = yield uploadableFiles_schema_1.default.find({
            url: { $in: urlsToDelete },
            _id: { $nin: filesToDelete.map((f) => f._id) },
        });
        // Extract safe-to-delete URLs (those not in stillExisting)
        const stillExistingUrls = new Set(stillExisting.map((f) => f.url));
        const safeFiles = filesToDelete.filter((f) => !stillExistingUrls.has(f.url));
        // Delete from Cloudinary only the safe files
        for (const file of safeFiles) {
            if (file.url && file.publicId) {
                const resourceType = file.filename.endsWith(".pdf") ? "raw" : "image";
                yield cloudinary_1.default.v2.uploader.destroy(file.publicId, {
                    resource_type: resourceType,
                    invalidate: true,
                });
            }
        }
        // Finally, delete from DB
        yield uploadableFiles_schema_1.default.deleteMany(filter);
        res.status(200).json({
            message: userId
                ? `Deleted completed+marked files for user ${userId}`
                : "Deleted completed+marked files globally",
            dbDeletedCount: filesToDelete.length,
            cloudinaryDeletedCount: safeFiles.length,
        });
    }
    catch (error) {
        console.error("Error deleting printouts:", error);
        res.status(500).json({ error: "Failed to delete printouts" });
    }
});
exports.clearAllPrintouts = clearAllPrintouts;
// Ordered Files
const deleteSelectedOrderedFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const file = yield OrderedPracticalFiles_schema_1.default.findByIdAndDelete(id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).json(file);
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
});
exports.deleteSelectedOrderedFile = deleteSelectedOrderedFile;
const clearAllOrderedFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        const filter = { status: "completed", deletedByUser: true };
        if (userId)
            filter.userId = userId;
        const files = yield OrderedPracticalFiles_schema_1.default.deleteMany(filter);
        res.status(200).json(files);
    }
    catch (error) {
        console.error("Error deleting files:", error);
        res.status(500).json({ error: "Failed to delete files" });
    }
});
exports.clearAllOrderedFiles = clearAllOrderedFiles;
// Query
const getTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield help_schema_1.default.find();
        res.status(200).json({ tickets });
    }
    catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});
exports.getTickets = getTickets;
const changeTicketStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const ticket = yield help_schema_1.default.findById(_id);
        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        ticket.status = "closed";
        yield ticket.save();
        res.status(200).json(ticket);
    }
    catch (error) {
        console.error("Error changing ticket status:", error);
        res.status(500).json({ error: "Failed to change ticket status" });
    }
});
exports.changeTicketStatus = changeTicketStatus;
const deleteTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.params;
        const ticket = yield help_schema_1.default.findByIdAndDelete(_id);
        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        res.status(200).json(ticket);
    }
    catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ error: "Failed to delete ticket" });
    }
});
exports.deleteTicket = deleteTicket;
const clearAllTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield help_schema_1.default.deleteMany({
            status: "closed",
            deletedByUser: true,
        });
        res.status(200).json({ tickets });
    }
    catch (error) {
        console.error("Error deleting tickets:", error);
        res.status(500).json({ error: "Failed to delete tickets" });
    }
});
exports.clearAllTickets = clearAllTickets;
// Change admin details
const adminSettingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admissionNo, password, userID } = req.body;
        const user = yield sign_up_schema_1.default.findById(userID);
        if (!user) {
            return res.status(404).json({ error: "No admin found" });
        }
        user.admissionNo = admissionNo;
        user.password = password;
        yield user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error changing admin details:", error);
        res.status(500).json({ error: "Failed to change admin details" });
    }
});
exports.adminSettingsController = adminSettingsController;
