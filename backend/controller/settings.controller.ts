import Help from "../schema/help.schema";
import OrderedPracticalFiles from "../schema/OrderedPracticalFiles.schema";
import SignUp from "../schema/sign-up.schema";
import { Request, Response } from "express";
import UploadFiles from "../schema/uploadableFiles.schema";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
dotenv.config();
cloudinary.v2.config({
  secure: true,
});
const fetchUserInfo = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await SignUp.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
};

const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await SignUp.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.admissionNo = req.body.admissionNo;
    user.department = req.body.department;
    user.year = req.body.year;
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Failed to update user info" });
  }
};

const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { newPassword, currentPassword } = req.body;
    const user = await SignUp.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // 2. Check old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 3. Set new password (hashing happens in pre("save"))
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Failed to update user info" });
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const folderName = await SignUp.findOne({ _id: userID });
    if (!folderName) {
      return res.status(404).json({ message: "User not found" });
    }

    const prefix = folderName.admissionNo;

    for (const type of ["image", "video", "raw"] as const) {
      await cloudinary.v2.api.delete_resources_by_prefix(prefix, {
        resource_type: type,
        invalidate: true,
      });
    }

    await SignUp.findOneAndDelete({ _id: userID });
    await Help.deleteMany({ ref_userId: userID });
    const orderedPracticalFiles = await OrderedPracticalFiles.deleteMany({
      userId: userID,
    });

    const uploadFiles = await UploadFiles.deleteMany({ userId: userID });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export { fetchUserInfo, deleteAccount, updateUserInfo, updateUserPassword };
