import { Request, Response } from "express";
import Help from "../schema/help.schema";
import { AuthRequest } from "../middleware/authMiddleware";

const helpController = async (req: Request, res: Response) => {
  try {
    const { admissionNo, email, query, ref_userId } = req.body;
    const help = new Help({ admissionNo, email, message: query, ref_userId });
    await help.save();
    res.status(201).json({ message: "Help ticket created successfully", help });
  } catch (error) {
    console.error("Error creating help ticket:", error);
    res.status(500).json({ message: "Failed to create help ticket" });
  }
};

const fetchHelpController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const help = await Help.find({ ref_userId: userId });
    res.status(200).json({ help });
  } catch (error) {
    console.error("Error fetching help tickets:", error);
    res.status(500).json({ message: "Failed to fetch help tickets" });
  }
};

const markDeleteTrue = async (req: AuthRequest, res: Response) => {
  try {
    const { _id } = req.body;
    const help = await Help.findByIdAndUpdate(_id, { deletedByUser: true });
    if (!help) {
      return res.status(404).json({ message: "Help ticket not found" });
    }

    res.status(200).json(help);
  } catch (error) {
    console.error("Error marking help ticket as deleted:", error);
    res.status(500).json({ message: "Failed to mark help ticket as deleted" });
  }
};

const deleteAllQueries = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const help = await Help.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedByUser: true } }
    );
    res.status(200).json(help);
  } catch (error) {
    console.error("Error deleting help tickets:", error);
    res.status(500).json({ message: "Failed to delete help tickets" });
  }
};
export {
  helpController,
  fetchHelpController,
  markDeleteTrue,
  deleteAllQueries,
};
