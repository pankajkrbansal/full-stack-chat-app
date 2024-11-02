import express from "express";
// import userController from "../controller/user.controller.js";
import chatController from "../controller/chat.controller.js";
import { singleAvatar } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();


chatRouter.post("/new", isAuthenticated, chatController.createNewChatGroup)

export default chatRouter;
