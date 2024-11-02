import express from "express";
import userController from "../controller/user.controller.js";
import { singleAvatar } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const userRouter = express.Router();

userRouter.post("/new", singleAvatar, userController.newUser);
userRouter.post("/login", userController.login);
userRouter.post("/logout", userController.logout);

userRouter.get("/my-profile", isAuthenticated, userController.getMyProfile);
userRouter.get("/search", isAuthenticated, userController.searchUser);

export default userRouter;
