import express from "express";
// import userController from "../controller/user.controller.js";
import chatController from "../controller/chat.controller.js";
import { singleAvatar } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();


chatRouter.post("/new", isAuthenticated, chatController.createNewChatGroup)
chatRouter.get("/my", isAuthenticated, chatController.getMyChat)
chatRouter.get("/my-groups", isAuthenticated, chatController.getMyGroup)
chatRouter.put("/add-members", isAuthenticated, chatController.addMemberToGroup)



export default chatRouter;
