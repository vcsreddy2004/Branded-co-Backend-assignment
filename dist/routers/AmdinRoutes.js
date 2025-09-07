"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/users/User"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthAdmin_1 = __importDefault(require("../middleWare/AuthAdmin"));
const AdminRouter = express_1.default.Router();
AdminRouter.post("/login", [
    (0, express_validator_1.body)("userName").not().isEmpty().withMessage("User Name can not left empty"),
    (0, express_validator_1.body)("password").not().isEmpty().withMessage("Password can not left empty"),
], async (req, res) => {
    let userData = {
        firstName: "",
        lastName: "",
        email: "",
        userName: req.body.userName,
        password: req.body.password,
        errorMessage: "",
        isAdmin: false,
        lastLogIn: null,
    };
    try {
        let errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            userData = {};
            const errorArray = errors.array();
            userData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(userData);
        }
        else {
            let token = await req.cookies["token"];
            let adminToken = await req.cookies["adminToken"];
            if (token || adminToken) {
                userData = {};
                userData.errorMessage = "you have already loged in";
                return res.status(400).json(userData);
            }
            else {
                let user = await User_1.default.findOne({ $or: [{ userName: userData.userName }, { email: userData.userName }] });
                if (user) {
                    if (await bcryptjs_1.default.compare(userData.password, user.password)) {
                        let payLoad = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                        };
                        if (!user.isAdmin) {
                            userData = {};
                            userData.errorMessage = "You have no access to this service";
                            return res.status(403).json(userData);
                        }
                        if (config_1.default.ADMIN_SECRET_KEY) {
                            let token = jsonwebtoken_1.default.sign(payLoad, config_1.default.ADMIN_SECRET_KEY);
                            user = await User_1.default.findOneAndUpdate({ userName: user.userName }, { lastLogIn: new Date() });
                            userData = {};
                            res.cookie("adminToken", token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 * 30, });
                            return res.status(200).json(userData);
                        }
                        else {
                            userData = {};
                            userData.errorMessage = "Something went wrong. Our team has been notified and is working on a fix.";
                            return res.status(500).json(userData);
                        }
                    }
                    else {
                        userData = {};
                        userData.errorMessage = "Invalid Password";
                        return res.status(400).json(userData);
                    }
                }
                else {
                    userData = {};
                    userData.errorMessage = "Username or email dose not exist";
                    return res.status(404).json(userData);
                }
            }
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/users-list", AuthAdmin_1.default, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const users = await User_1.default.find().select("-password").sort({ _id: -1 }).skip((page - 1) * 8).limit(8);
        const userData = users.map((e) => ({
            firstName: e.firstName,
            lastName: e.lastName,
            email: e.email,
            userName: e.userName,
            lastLogIn: e.lastLogIn,
            password: "",
            isAdmin: e.isAdmin,
            errorMessage: ""
        }));
        return res.status(200).json(userData);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
AdminRouter.delete("/delete-user", AuthAdmin_1.default, [
    (0, express_validator_1.body)("userName").not().isEmpty().withMessage("User Name can not left empty"),
], async (req, res) => {
    try {
        const userName = req.body.userName;
        const userData = req.body.user;
        let errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errorMessage: "User Name cant left empty" });
        }
        if (userName === userData.userName) {
            return res.status(403).json({ errorMessage: "You can not delete your self" });
        }
        const user = await User_1.default.findOneAndDelete({ userName });
        if (user) {
            return res.status(204).json({});
        }
        else {
            return res.status(404).json({ errorMessage: "User not found to delete" });
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/me", AuthAdmin_1.default, async (req, res) => {
    try {
        let userData = req.body.user;
        return res.status(200).json(userData);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/logout", AuthAdmin_1.default, async (req, res) => {
    try {
        res.clearCookie("adminToken", { httpOnly: true, sameSite: "lax", secure: false, path: "/", });
        return res.status(204).json({});
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
exports.default = AdminRouter;
//# sourceMappingURL=AmdinRoutes.js.map