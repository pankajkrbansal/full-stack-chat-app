import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { CustomError } from "../utilities/customError.js";
import { emitEvent } from "../utilities/features.js";
import {
  ALERT,
  REFETCH_CHATS,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  NEW_ATTACHMENT,
} from "../constants/events.js";
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

chatController.removeMember = async (req, res, next) => {
  const { userId, chatId } = req.body;
  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);

  if (!chat) return next(new CustomError("Chat not found", 404));

  if (!chat.groupChat)
    return next(new CustomError("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString())
    return next(new CustomError("You are not allowed to add members", 403));

  if (chat.members.length <= 3)
    return next(new CustomError("Group must have at least 3 members", 400));

  const allChatMembers = chat.members.map((i) => i.toString());

  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, allChatMembers);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
};

chatController.leaveGroup = async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new CustomError("Chat not found", 404));

  if (!chat.groupChat)
    return next(new CustomError("This is not a group chat", 400));

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user.toString()
  );

  if (remainingMembers.length < 3)
    return next(new CustomError("Group must have at least 3 members", 400));

  if (chat.creator.toString() === req.user.toString()) {
    const randomElement = Math.floor(Math.random() * remainingMembers.length);
    const newCreator = remainingMembers[randomElement];
    chat.creator = newCreator;
  }

  chat.members = remainingMembers;

  const [user] = await Promise.all([
    User.findById(req.user, "name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, {
    chatId,
    message: `User ${user.name} has left the group`,
  });

  return res.status(200).json({
    success: true,
    message: "Leave Group Successfully",
  });
};

chatController.sendAttachments = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    const files = req.files || [];

    if (files.length < 1)
      return next(new CustomError("Please Upload Attachments", 400));

    if (files.length > 5)
      return next(new CustomError("Files Can't be more than 5", 400));

    const [chat, me] = await Promise.all([
      Chat.findById(chatId),
      User.findById(req.user, "name"),
    ]);

    if (!chat) return next(new CustomError("Chat not found", 404));

    if (files.length < 1)
      return next(new CustomError("Please provide attachments", 400));

    //   Upload files here
    const attachments = await uploadFilesToCloudinary(files);

    const messageForDB = {
      content: "",
      attachments,
      sender: me._id,
      chat: chatId,
    };

    const messageForRealTime = {
      ...messageForDB,
      sender: {
        _id: me._id,
        name: me.name,
      },
    };

    const message = await Message.create(messageForDB);

    emitEvent(req, NEW_MESSAGE, chat.members, {
      message: messageForRealTime,
      chatId,
    });

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (err) {
    next(err);
  }
};

chatController.getChatDetails = async (req, res, next) => {};

export default chatController;
