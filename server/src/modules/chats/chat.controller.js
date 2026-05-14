const chatService = require('./chat.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all chats for the logged-in user
 * @route   GET /api/v1/chats
 * @access  Private
 */
const getUserChats = catchAsync(async (req, res) => {
  const chats = await chatService.getUserChats(req.user._id);
  sendResponse(res, 200, chats, 'Chats retrieved');
});

/**
 * @desc    Get or create a chat with another user
 * @route   POST /api/v1/chats
 * @access  Private
 */
const getOrCreateChat = catchAsync(async (req, res) => {
  const { otherUserId, listingId } = req.body;
  const chat = await chatService.getOrCreateChat(req.user._id, otherUserId, listingId);
  sendResponse(res, 200, chat, 'Chat ready');
});

/**
 * @desc    Get messages for a chat
 * @route   GET /api/v1/chats/:id/messages
 * @access  Private (participant)
 */
const getChatMessages = catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await chatService.getChatMessages(req.params.id, req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Messages retrieved');
});

/**
 * @desc    Send a message in a chat
 * @route   POST /api/v1/chats/:id/messages
 * @access  Private (participant)
 */
const sendMessage = catchAsync(async (req, res) => {
  const { text } = req.body;
  const message = await chatService.sendMessage(req.params.id, req.user._id, text);
  sendResponse(res, 201, message, 'Message sent');
});

/**
 * @desc    Mark messages as read in a chat
 * @route   PATCH /api/v1/chats/:id/read
 * @access  Private (participant)
 */
const markAsRead = catchAsync(async (req, res) => {
  const result = await chatService.markMessagesAsRead(req.params.id, req.user._id);
  sendResponse(res, 200, result, 'Messages marked as read');
});

module.exports = {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  markAsRead,
};
