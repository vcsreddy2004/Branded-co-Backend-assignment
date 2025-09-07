"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserRouter_1 = __importDefault(require("./routers/UserRouter"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AmdinRoutes_1 = __importDefault(require("./routers/AmdinRoutes"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "300kb" }));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true,
}));
app.use("/api/users", UserRouter_1.default);
app.use("/api/admins", AmdinRoutes_1.default);
if (config_1.default.MONGO_DB_URL) {
    mongoose_1.default.connect(config_1.default.MONGO_DB_URL).then((res) => {
        console.log("mongo db connected");
    }).catch((err) => {
        console.log("error in mongodb connection");
    });
}
app.get("/", (req, res) => {
    return res.status(200).json({
        "msg": "server is running"
    });
});
if (config_1.default.PORT) {
    app.listen(config_1.default.PORT, () => {
        console.log("server started");
    });
}
//# sourceMappingURL=server.js.map