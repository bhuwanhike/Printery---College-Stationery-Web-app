import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import authRouter from "./routes/auth.route";
import uploadFileToDrive from "./routes/cloudinaryUpload.route";
import uploadableFilesRouter from "./routes/uploadableFiles.route";
import getPracticalFiles from "./routes/practicalFiles.route";
import orderPracticalFilesRouter from "./routes/orderPracticalFIles.route";
import logout from "./routes/logout.route";
import adminRouter from "./routes/admin.route";
import helpRouter from "./routes/help.route";
import settingsRouter from "./routes/settings.route";
connectDB();

const PORT = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN;

const app = express();

const corsOptions = {
  origin: corsOrigin,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/upload", uploadFileToDrive);
app.use("/uploadableFiles-DB", uploadableFilesRouter);
app.use("/practical-files", getPracticalFiles);
app.use("/order-practical-files", orderPracticalFilesRouter);
app.use("/logout", logout);
app.use("/admin/order-practical-files", adminRouter);
app.use("/help", helpRouter);
app.use("/settings", settingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
