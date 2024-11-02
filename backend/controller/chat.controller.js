import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { CustomError } from "../utilities/customError.js";
import { emitEvent } from "../utilities/features.js";
import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import mongoose from "mongoose";
import { getOtherMember } from "../lib/helper.js";

const { ObjectId } = mongoose.Types;
let chatController = {};

chatController.createNewChatGroup = async (req, res, next) => {
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
    success: true,
    message: "Group Chat Created",
  });
};

chatController.getMyChat = async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "name avatar"
  );

  const transformChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map((avatar) => avatar.url)
        : [otherMember.avatar.url],
      name: groupChat ? name : otherMember.name,
      members: members,
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformChats,
  });
};

chatController.getMyGroup = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      creator: req.user,
      groupChat: true,
      members: req.user,
    }).populate("members", "name avatar");

    const groups = chats.map(({ members, _id, groupChat, name }) => ({
      _id,
      groupChat,
      name,
      avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));

    return res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    next(error);
  }
};

chatController.addMemberToGroup = async (req, res, next) => {
  try {
    const { chatId, members } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new CustomError("Chat Not Found", 404));
    }

    if (!chat.groupChat) {
      return next(new CustomError("Not Group Chat", 400));
    }

    if (chat.creator.toString() !== req.user.toString()) {
      return next(new errorHandler("You cannot add members", 403));
    }

    const allNewMembersPromise = members.map((i) => User.findById(i));

    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers
      .filter((i) => !chat.members.includes(i._id.toString()))
      .map((i) => i._id);

    // chat.members.push(...allNewMembers.map((i) => i._id));
    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100) {
      return next(new CustomError("Group Limit Reached", 400));
    }

    await chat.save();

    const allUserName = allNewMembers.map((i) => i.name).join(",");

    emitEvent(
      req,
      ALERT,
      chat.members,
      `You have been added to ${chat.name} by ${req.user.name}`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
      success: true,
      message: "Members Added To Group",
    });
  } catch (error) {
    next(error);
  }
};

export default chatController;
