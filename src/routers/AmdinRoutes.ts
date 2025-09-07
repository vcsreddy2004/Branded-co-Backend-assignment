import express from "express";
import { IUser } from "../models/users/IUser";
import User from "../models/users/User";
import { UserView } from "../models/users/userView";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import config from "../config";
import jwt from "jsonwebtoken";
import AuthAdmin from "../middleWare/AuthAdmin";
const AdminRouter:express.Router = express.Router();
AdminRouter.post("/login",[
    body("userName").not().isEmpty().withMessage("User Name can not left empty"),
    body("password").not().isEmpty().withMessage("Password can not left empty"),
],async(req:express.Request,res:express.Response)=>{
    let userData:UserView = {
        firstName:"",
        lastName:"",
        email:"",
        userName:req.body.userName,
        password:req.body.password,
        errorMessage:"",
        isAdmin:false,
        lastLogIn:null,
    }
    try {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            userData = {} as UserView;
            const errorArray = errors.array();
            userData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(userData);
        }
        else {
            let token = await req.cookies["token"];
            let adminToken = await req.cookies["adminToken"];
            if(token || adminToken) {    
                userData = {} as UserView;
                userData.errorMessage = "you have already loged in";
                return res.status(400).json(userData);
            }
            else {
                let user:IUser | null = await User.findOne({$or: [{ userName: userData.userName },{ email: userData.userName }]});
                if(user) {
                    if(await bcrypt.compare(userData.password,user.password)) {
                        let payLoad = {
                            firstName:user.firstName,
                            lastName:user.lastName,
                            email:user.email,
                        }
                        if(!user.isAdmin) {
                            userData = {} as UserView;
                            userData.errorMessage = "You have no access to this service";
                            return res.status(403).json(userData);
                        }
                        if(config.ADMIN_SECRET_KEY) {
                            let token:string = jwt.sign(payLoad,config.ADMIN_SECRET_KEY);
                            user = await User.findOneAndUpdate({userName:user.userName},{lastLogIn:new Date()});
                            userData = {} as UserView;
                            res.cookie("adminToken", token, {httpOnly: true,sameSite: 'lax',secure: false,maxAge: 1000 * 60 * 60 * 24 * 30,}); 
                            return res.status(200).json(userData);
                        }
                        else {
                            userData = {} as UserView;
                            userData.errorMessage = "Something went wrong. Our team has been notified and is working on a fix.";
                            return res.status(500).json(userData);
                        }
                    }
                    else {
                        userData = {} as UserView;
                        userData.errorMessage = "Invalid Password";
                        return res.status(400).json(userData);
                    }
                }
                else {
                    userData = {} as UserView;
                    userData.errorMessage = "Username or email dose not exist";
                    return res.status(404).json(userData);
                }
            }
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/users-list",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        const page = parseInt(req.query.page as string) || 1;
        const users:IUser[] | null = await User.find().select("-password").sort({ _id: -1 }).skip((page - 1) * 8).limit(8);
        const userData: UserView[] = users.map((e) => ({
            firstName:e.firstName,
            lastName:e.lastName,
            email:e.email,
            userName:e.userName,
            lastLogIn:e.lastLogIn,
            password:"",
            isAdmin:e.isAdmin,
            errorMessage: ""
        }));
        return res.status(200).json(userData);
    }
    catch(err) {
        res.status(500).json(err);
    }
});
AdminRouter.delete("/delete-user",AuthAdmin,[
    body("userName").not().isEmpty().withMessage("User Name can not left empty"),
],async(req:express.Request,res:express.Response)=>{
    try {
        const userName:string = req.body.userName;
        const userData:UserView = req.body.user;
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errorMessage:"User Name cant left empty"});
        }
        if(userName===userData.userName) {
            return res.status(403).json({errorMessage:"You can not delete your self"});
        }
        const user:IUser | null = await User.findOneAndDelete({userName});
        if(user) {
            return res.status(204).json({});   
        }
        else {
            return res.status(404).json({errorMessage:"User not found to delete"});
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
})
AdminRouter.get("/me",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        let userData:UserView = req.body.user;
        return res.status(200).json(userData);
    }
    catch(err) {
        return res.status(500).json(err);   
    }
});
AdminRouter.get("/logout",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        res.clearCookie("adminToken", {httpOnly: true,sameSite: "lax",secure: false,path: "/",});
        return res.status(204).json({});
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
export default AdminRouter;