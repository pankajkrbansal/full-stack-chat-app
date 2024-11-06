import express from "express";
// import userController from "../controller/user.controller.js";
import chatController from "../controller/chat.controller.js";
import { multerAttachments, singleAvatar } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/new", isAuthenticated, chatController.createNewChatGroup);
chatRouter.get("/my", isAuthenticated, chatController.getMyChat);
chatRouter.get("/my-groups", isAuthenticated, chatController.getMyGroup);
chatRouter.put(
  "/add-members",
  isAuthenticated,
  chatController.addMemberToGroup
);
chatRouter.put("/remove-member", isAuthenticated, chatController.removeMember);
chatRouter.delete("/leave-group/:id", isAuthenticated, chatController.leaveGroup);
chatRouter.post("/message", isAuthenticated, multerAttachments, chatController.sendAttachments)


export default chatRouter;
