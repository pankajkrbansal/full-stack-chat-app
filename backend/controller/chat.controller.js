import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { CustomError } from "../utilities/customError.js";
import { emitEvent } from "../utilities/features.js";
import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
let chatController = {};

chatController.createNewChatGroup = async (req, res, next) => {
    console.log(req.body);
    
  const { name, members } = req.body;

  if (members.length < 2) {
    return next(new CustomError("Atleast 3 members required", 400));
  }

  const allMembers = [...members, req.user];

  // Convert each member ID to ObjectId
  const memberIds = allMembers.map((member) => new ObjectId(member));

  await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    members: memberIds,
  });

  emitEvent(req, ALERT, allMembers, `Welcome To ${name} Group`);
  emitEvent(req, REFETCH_CHATS, members, "");

  return res.status(201).json({
    success:true,
    message:"Group Chat Created"
  })
};

export default chatController;
