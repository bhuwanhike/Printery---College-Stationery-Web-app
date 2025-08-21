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
exports.deleteAllQueries = exports.markDeleteTrue = exports.fetchHelpController = exports.helpController = void 0;
const help_schema_1 = __importDefault(require("../schema/help.schema"));
const helpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admissionNo, email, query, ref_userId } = req.body;
        const help = new help_schema_1.default({ admissionNo, email, message: query, ref_userId });
        yield help.save();
        res.status(201).json({ message: "Help ticket created successfully", help });
    }
    catch (error) {
        console.error("Error creating help ticket:", error);
        res.status(500).json({ message: "Failed to create help ticket" });
    }
});
exports.helpController = helpController;
const fetchHelpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const help = yield help_schema_1.default.find({ ref_userId: userId });
        res.status(200).json({ help });
    }
    catch (error) {
        console.error("Error fetching help tickets:", error);
        res.status(500).json({ message: "Failed to fetch help tickets" });
    }
});
exports.fetchHelpController = fetchHelpController;
const markDeleteTrue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const help = yield help_schema_1.default.findByIdAndUpdate(_id, { deletedByUser: true });
        if (!help) {
            return res.status(404).json({ message: "Help ticket not found" });
        }
        res.status(200).json(help);
    }
    catch (error) {
        console.error("Error marking help ticket as deleted:", error);
        res.status(500).json({ message: "Failed to mark help ticket as deleted" });
    }
});
exports.markDeleteTrue = markDeleteTrue;
const deleteAllQueries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        const help = yield help_schema_1.default.updateMany({ _id: { $in: ids } }, { $set: { deletedByUser: true } });
        res.status(200).json(help);
    }
    catch (error) {
        console.error("Error deleting help tickets:", error);
        res.status(500).json({ message: "Failed to delete help tickets" });
    }
});
exports.deleteAllQueries = deleteAllQueries;
