import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import authRouter from "./routes/auth.route";
import uploadFileToDrive from "./routes/cloudinaryUpload.route";
import getJWTdecode from "./routes/auth.route";
import uploadableFilesRouter from "./routes/uploadableFiles.route";

import getPracticalFiles from "./routes/practicalFiles.route";
import orderPracticalFilesRouter from "./routes/orderPracticalFIles.route";
import logout from "./routes/logout.route";
import adminRouter from "./routes/admin.route";
connectDB();
const PORT = process.env.PORT || 3000;

const app = express();

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // exact origin
    credentials: true, // allow cookies/auth headers
  })
);

app.use("/auth", authRouter);
app.use("/upload", uploadFileToDrive);
app.use("/auth", getJWTdecode);
app.use("/uploadableFiles-DB", uploadableFilesRouter);
app.use("/practical-files", getPracticalFiles);
app.use("/order-practical-files", orderPracticalFilesRouter);
app.use("/logout", logout);
app.use("/admin/order-practical-files", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
