"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const cloudinaryUpload_route_1 = __importDefault(require("./routes/cloudinaryUpload.route"));
const uploadableFiles_route_1 = __importDefault(require("./routes/uploadableFiles.route"));
const practicalFiles_route_1 = __importDefault(require("./routes/practicalFiles.route"));
const orderPracticalFIles_route_1 = __importDefault(require("./routes/orderPracticalFIles.route"));
const logout_route_1 = __importDefault(require("./routes/logout.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const help_route_1 = __importDefault(require("./routes/help.route"));
const settings_route_1 = __importDefault(require("./routes/settings.route"));
(0, db_1.default)();
const PORT = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN;
const app = (0, express_1.default)();
const corsOptions = {
    origin: corsOrigin,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use("/auth", auth_route_1.default);
app.use("/upload", cloudinaryUpload_route_1.default);
app.use("/uploadableFiles-DB", uploadableFiles_route_1.default);
app.use("/practical-files", practicalFiles_route_1.default);
app.use("/order-practical-files", orderPracticalFIles_route_1.default);
app.use("/logout", logout_route_1.default);
app.use("/admin/order-practical-files", admin_route_1.default);
app.use("/help", help_route_1.default);
app.use("/settings", settings_route_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
