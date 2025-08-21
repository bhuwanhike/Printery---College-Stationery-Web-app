import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/isAdmin";
import {
  getAllOrderedFilesController,
  orderPracticalFilesController,
  changeFileStatus,
  changePrintoutStatus,
  getTickets,
  changeTicketStatus,
  deleteTicket,
  clearAllTickets,
  deleteSelectedFile,
  clearAllPrintouts,
  deleteSelectedOrderedFile,
  clearAllOrderedFiles,
} from "../controller/admin.controller";

const Router = express.Router();

Router.route("/")
  .post(authMiddleware, adminMiddleware, orderPracticalFilesController)
  .get(authMiddleware, adminMiddleware, getAllOrderedFilesController)
  .delete(authMiddleware, adminMiddleware, deleteSelectedFile);
Router.route("/changeFileStatus").put(
  authMiddleware,
  adminMiddleware,
  changeFileStatus
);
Router.route("/printouts").delete(
  authMiddleware,
  adminMiddleware,
  clearAllPrintouts
);
Router.route("/orderedFiles/delete-selected").delete(
  authMiddleware,
  adminMiddleware,
  deleteSelectedOrderedFile
);
Router.route("/orderedFiles/delete-all").delete(
  authMiddleware,
  adminMiddleware,
  clearAllOrderedFiles
);
Router.route("/tickets")
  .get(authMiddleware, adminMiddleware, getTickets)
  .put(authMiddleware, adminMiddleware, changeTicketStatus)
  .delete(authMiddleware, adminMiddleware, clearAllTickets);
Router.route("/changePrintoutStatus/:id").put(
  authMiddleware,
  adminMiddleware,
  changePrintoutStatus
);

Router.route("/tickets/:_id").delete(
  authMiddleware,
  adminMiddleware,
  deleteTicket
);

export default Router;
