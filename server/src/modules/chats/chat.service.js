const Chat = require('./chat.model');
const Message = require('./message.model');
const ApiError = require('../../utils/ApiError');

/**
 * Get or create a chat between two users, optionally linked to a listing.
 */
const getOrCreateChat = async (userId, otherUserId, listingId) => {
  if (userId.toString() === otherUserId.toString()) {
    throw new ApiError(400, 'Cannot start a chat with yourself');
  }

  // Check if a chat already exists between these users for this listing
  const query = {
    participants: { $all: [userId, otherUserId] },
  };
  if (listingId) {
    query.listing = listingId;
  }

  let chat = await Chat.findOne(query)
    .populate('participants', 'name profileImage role')
    .populate('listing', 'title category subCategory pricing');

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, otherUserId],
      listing: listingId || undefined,
      unreadCount: new Map(),
    });
    chat = await Chat.findById(chat._id)
      .populate('participants', 'name profileImage role')
      .populate('listing', 'title category subCategory pricing');
  }

  return chat;
};

/**
 * Send a message in a chat.
 */
const sendMessage = async (chatId, senderId, text) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, 'Chat not found');

  // Verify the sender is a participant
  const isParticipant = chat.participants.some(
    (p) => p.toString() === senderId.toString()
  );
  if (!isParticipant) throw new ApiError(403, 'Not a participant of this chat');

  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    text,
  });

  // Update chat's last message
  chat.lastMessage = {
    text,
    sender: senderId,
    timestamp: new Date(),
  };

  // Increment unread count for other participants
  chat.participants.forEach((p) => {
    if (p.toString() !== senderId.toString()) {
      const current = chat.unreadCount.get(p.toString()) || 0;
      chat.unreadCount.set(p.toString(), current + 1);
    }
  });

  await chat.save();

  // Populate and return the message
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name profileImage');

  return populatedMessage;
};

/**
 * Get messages for a chat with pagination.
 */
const getChatMessages = async (chatId, userId, { page = 1, limit = 50 }) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, 'Chat not found');

  const isParticipant = chat.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) throw new ApiError(403, 'Not a participant of this chat');

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ chat: chatId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chat: chatId }),
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get all chats for a user.
 */
const getUserChats = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name profileImage role')
    .populate('listing', 'title category subCategory')
    .sort({ 'lastMessage.timestamp': -1 });

  // Add computed field for unread count for this user
  return chats.map((chat) => {
    const chatObj = chat.toObject();
    chatObj.myUnreadCount = chat.unreadCount.get(userId.toString()) || 0;
    return chatObj;
  });
};

/**
 * Mark all messages in a chat as read for a user.
 */
const markMessagesAsRead = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, 'Chat not found');

  const isParticipant = chat.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) throw new ApiError(403, 'Not a participant of this chat');

  // Mark all unread messages from others as read
  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, read: false },
    { read: true }
  );

  // Reset unread count
  chat.unreadCount.set(userId.toString(), 0);
  await chat.save();

  return { success: true };
};

module.exports = {
  getOrCreateChat,
  sendMessage,
  getChatMessages,
  getUserChats,
  markMessagesAsRead,
};
