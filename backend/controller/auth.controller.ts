import SignUp from "../schema/sign-up.schema";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const SignUpController = async (req: Request, res: Response) => {
  try {
    const { admissionNo, department, year, password } = req.body;

    const existingUser = await SignUp.findOne({ admissionNo: admissionNo });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const user = await SignUp.create({
      admissionNo,
      department,
      year,
      password,
    });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

const LoginController = async (req: Request, res: Response) => {
  try {
    const { admissionNo, password, admin_username } = req.body;

    if (admin_username) {
      const existingAdmin = await SignUp.findOne({
        admissionNo: admin_username,
        isAdmin: true,
      });
      if (!existingAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const isMatch = await existingAdmin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      const token = existingAdmin.generateToken(); // no await if you make it sync
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return res
        .status(200)
        .json({ message: "Login successful", isAdmin: true });
    } else {
      const existingUser = await SignUp.findOne({ admissionNo: admissionNo });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await existingUser.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const token = existingUser.generateToken(); // no await if you make it sync

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return res
        .status(200)
        .json({ message: "Login successful", isAdmin: false });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Failed to log in" });
  }
};

const getJWTdecode = (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ error: "Unauthorized from getJWTdecode" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      admissionNo: string;
      userId: string;
      isAdmin: boolean;
    };
    res.json({
      admissionNo: decoded.admissionNo,
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const fetchUsers = async (req: Request, res: Response) => {
  try {
    const users = await SignUp.find()
      .select("-password")
      .where({ isAdmin: false });
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export { SignUpController, LoginController, getJWTdecode, fetchUsers };
